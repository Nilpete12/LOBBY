import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET the current status of a specific booking (Rider uses this to check if accepted)
export async function GET(req, { params }) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const formattedBooking = { ...booking, _id: booking.id, driverId: booking.driver_id };
    return NextResponse.json({ success: true, booking: formattedBooking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH to update the booking status (Driver uses this to Accept)
export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const { status, driverId } = body;

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status: status, driver_id: driverId })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    const formattedBooking = { ...updatedBooking, _id: updatedBooking.id, driverId: updatedBooking.driver_id };
    return NextResponse.json({ success: true, booking: formattedBooking });
    
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}