import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    // 1. Securely get the logged-in driver's ID from Clerk
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all bookings assigned to this driver, newest first
    const { data: history, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('driver_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Format the Postgres flat rows back into the nested JSON your React frontend expects
    const formattedHistory = history.map(ride => ({
      ...ride,
      _id: ride.id,
      riderId: ride.rider_id,
      driverId: ride.driver_id,
      riderName: ride.rider_name,
      riderPhone: ride.rider_phone,
      // Re-pack the coordinates into the object structure your frontend uses
      pickupLocation: {
        lat: ride.pickup_lat,
        lng: ride.pickup_lng,
        address: ride.pickup_address
      },
      createdAt: ride.created_at
    }));

    return NextResponse.json({ success: true, history: formattedHistory });
    
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}