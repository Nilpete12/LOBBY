import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, driverId, riderId } = body;

    if (!type) {
      return NextResponse.json({ success: false, message: 'Event type is required' }, { status: 400 });
    }

    // Insert the analytics event into Postgres
    const { error } = await supabase
      .from('analytics')
      .insert([
        {
          event_type: type,
          driver_id: driverId || null,
          rider_id: riderId || null
        }
      ]);

    if (error) throw error;

    // We don't need to return the data, just a success flag since this happens in the background
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Analytics Tracking Error:", error);
    // Even if tracking fails, we return a 200 so we don't break the user's UI
    return NextResponse.json({ success: false, message: 'Failed to track event' }, { status: 200 });
  }
}