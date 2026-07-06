import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req, context) {
  try {
    const params = await context.params;
    const body = await req.json();
    const { lat, lng } = body;

    const { data, error } = await supabase
      .from('bookings')
      .update({
        pickup_lat: lat,
        pickup_lng: lng
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error("Location Update Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to update location' }, { status: 500 });
  }
}