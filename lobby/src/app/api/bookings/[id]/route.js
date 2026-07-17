import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { formatBooking, formatUser } from '@/lib/supabaseFormat';

const ALLOWED_DRIVER_STATUSES = new Set(['accepted', 'completed', 'cancelled']);

async function loadDriver(driverClerkId) {
  if (!driverClerkId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', driverClerkId)
    .maybeSingle();

  if (error) throw error;
  return data ? formatUser(data) : null;
}

// GET the current status of a specific booking (Rider uses this to check if accepted)
export async function GET(req, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.rider_id !== userId && booking.driver_id !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const driver = await loadDriver(booking.driver_id);
    return NextResponse.json({ success: true, booking: formatBooking(booking, driver) });
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PATCH to update the booking status (Driver uses this to Accept)
export async function PATCH(req, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!ALLOWED_DRIVER_STATUSES.has(status)) {
      return NextResponse.json({ success: false, message: 'Invalid booking status' }, { status: 400 });
    }

    const { data: existingBooking, error: existingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingBooking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    if (status === 'accepted' && existingBooking.driver_id && existingBooking.driver_id !== userId) {
      return NextResponse.json({ success: false, message: 'This booking was already accepted by another driver' }, { status: 409 });
    }

    if (status === 'accepted' && !['pending', 'accepted'].includes(existingBooking.status)) {
      return NextResponse.json({ success: false, message: 'This booking is no longer available' }, { status: 409 });
    }

    if (status !== 'accepted' && existingBooking.driver_id !== userId) {
      return NextResponse.json({ success: false, message: 'Only the assigned driver can update this booking' }, { status: 403 });
    }

    const updates = { status };
    if (status === 'accepted') {
      updates.driver_id = userId;
      updates.accepted_at = new Date().toISOString();
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    const driver = await loadDriver(updatedBooking.driver_id);
    return NextResponse.json({ success: true, booking: formatBooking(updatedBooking, driver) });
    
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to update booking' }, { status: 500 });
  }
}
