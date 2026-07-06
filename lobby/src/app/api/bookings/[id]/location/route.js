import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getValidLocation(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

export async function POST(req, context) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const location = getValidLocation(body);

    if (!location) {
      return NextResponse.json(
        { success: false, message: 'A valid location is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        pickup_lat: location.lat,
        pickup_lng: location.lng,
        pickup_address: 'Live pickup location',
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('rider_id', userId)
      .in('status', ['pending', 'accepted'])
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Booking is not available for live location updates' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking Location Update Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking location' },
      { status: 500 }
    );
  }
}
