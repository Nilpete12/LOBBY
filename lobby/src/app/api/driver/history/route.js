import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function startOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff).toISOString();
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

async function countAnalytics(driverId, eventType, since) {
  let query = supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('driver_id', driverId)
    .eq('event_type', eventType);

  if (since) query = query.gte('created_at', since);

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data: driverRow, error: driverError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .eq('role', 'driver')
      .maybeSingle();

    if (driverError) throw driverError;
    if (!driverRow) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = startOfDay(now);
    const week = startOfWeek(now);
    const month = startOfMonth(now);
    const driverId = driverRow.id;

    const [
      eventsResult,
      totalCalls,
      totalProfileViews,
      totalWhatsAppClicks,
      callsToday,
      callsThisWeek,
      profileViewsThisMonth,
      callClicksThisMonth,
      whatsappClicksThisMonth,
    ] = await Promise.all([
      supabase
        .from('analytics')
        .select('*')
        .eq('driver_id', driverId)
        .in('event_type', ['call_click', 'whatsapp_click'])
        .order('created_at', { ascending: false })
        .limit(50),
      countAnalytics(driverId, 'call_click'),
      countAnalytics(driverId, 'profile_view'),
      countAnalytics(driverId, 'whatsapp_click'),
      countAnalytics(driverId, 'call_click', today),
      countAnalytics(driverId, 'call_click', week),
      countAnalytics(driverId, 'profile_view', month),
      countAnalytics(driverId, 'call_click', month),
      countAnalytics(driverId, 'whatsapp_click', month),
    ]);

    if (eventsResult.error) throw eventsResult.error;

    const events = eventsResult.data || [];
    const riderIds = [...new Set(events.map((event) => event.rider_id).filter(Boolean))];
    const ridersResult = riderIds.length
      ? await supabase.from('users').select('clerk_id,full_name,email').in('clerk_id', riderIds)
      : { data: [], error: null };

    if (ridersResult.error) throw ridersResult.error;

    const riderByClerkId = new Map((ridersResult.data || []).map((rider) => [rider.clerk_id, rider]));
    const history = events.map((event) => {
      const rider = event.rider_id ? riderByClerkId.get(event.rider_id) : null;
      return {
        _id: event.id,
        type: event.event_type,
        timestamp: event.created_at,
        rider: rider
          ? { fullName: rider.full_name || 'Rider', email: rider.email || '' }
          : { fullName: event.rider_id ? 'Rider' : 'Guest rider', email: '' },
      };
    });

    return NextResponse.json({
      success: true,
      driver: formatUser(driverRow),
      stats: {
        totalCalls,
        totalProfileViews,
        totalWhatsAppClicks,
        callsToday,
        callsThisWeek,
        profileViewsThisMonth,
        callClicksThisMonth,
        whatsappClicksThisMonth,
      },
      history,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}
