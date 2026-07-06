import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { pickupLocation, destination, riderName, riderPhone } = body;

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          rider_id: userId,
          rider_name: riderName,
          rider_phone: riderPhone,
          pickup_lat: pickupLocation.lat,
          pickup_lng: pickupLocation.lng,
          pickup_address: pickupLocation.address || 'Kohima Area',
          destination: destination,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Convert snake_case back to camelCase for the frontend
    const formattedBooking = { ...booking, _id: booking.id, driverId: booking.driver_id };

    return NextResponse.json({ success: true, booking: formattedBooking });
    
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}