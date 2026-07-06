import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

const ALLOWED_EVENT_TYPES = new Set(['profile_view', 'call_click', 'whatsapp_click']);

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'analytics-track',
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (limited) return limited;

  try {
    const body = await request.json();
    const type = typeof body.type === 'string' ? body.type : '';

    if (!ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, message: 'Unsupported analytics event' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('analytics').insert({
      event_type: type,
      driver_id: body.driverId || null,
      rider_id: body.riderId || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Analytics Tracking Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to track event' }, { status: 200 });
  }
}
