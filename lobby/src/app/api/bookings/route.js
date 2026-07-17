import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';
import { formatBooking } from '@/lib/supabaseFormat';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';
import { getPlatformSettings } from '@/lib/platformSettings';

const OPTIONAL_BOOKING_COLUMNS = new Set(['requested_stand']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { pickupLocation = {}, destination, riderName, riderPhone, requestedStand } = body;
    const settings = await getPlatformSettings();

    if (settings.maintenanceMode || !settings.bookingOpen) {
      return NextResponse.json(
        { success: false, message: 'Instant bookings are temporarily closed.' },
        { status: 503 }
      );
    }

    const cleanPhone = cleanString(riderPhone, 40);
    const cleanDestination = cleanString(destination, 160) || 'Kohima';
    const cleanRequestedStand = cleanString(requestedStand, 120);
    const user = await currentUser();
    const displayName = cleanString(
      riderName || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      160
    ) || 'Rider';

    if (!Number.isFinite(Number(pickupLocation.lat)) || !Number.isFinite(Number(pickupLocation.lng))) {
      return NextResponse.json({ success: false, message: 'A valid pickup location is required' }, { status: 400 });
    }

    if (cleanPhone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ success: false, message: 'A phone number is required for driver callback' }, { status: 400 });
    }

    const bookingRow = {
      rider_id: userId,
      rider_name: displayName,
      rider_phone: cleanPhone,
      pickup_lat: Number(pickupLocation.lat),
      pickup_lng: Number(pickupLocation.lng),
      pickup_address: cleanString(pickupLocation.address, 240) || 'Current Location',
      destination: cleanDestination,
      requested_stand: cleanRequestedStand || null,
      status: 'pending',
    };

    const booking = await writeWithColumnFallback(
      bookingRow,
      OPTIONAL_BOOKING_COLUMNS,
      (row) => supabase.from('bookings').insert(row).select().single()
    );

    return NextResponse.json({ success: true, booking: formatBooking(booking) });
    
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to create booking' }, { status: 500 });
  }
}
