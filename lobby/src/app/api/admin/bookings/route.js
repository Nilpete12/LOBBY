import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { formatBooking, formatUser } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

const ALLOWED_STATUSES = new Set(['pending', 'accepted', 'completed', 'cancelled']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { searchParams } = new URL(request.url);
  const status = cleanString(searchParams.get('status'), 40);

  try {
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (ALLOWED_STATUSES.has(status)) bookingsQuery = bookingsQuery.eq('status', status);

    const { data: bookings = [], error: bookingsError } = await bookingsQuery;
    if (bookingsError) throw bookingsError;

    const driverClerkIds = [...new Set(bookings.map((booking) => booking.driver_id).filter(Boolean))];
    const driversResult = driverClerkIds.length
      ? await supabase.from('users').select('*').in('clerk_id', driverClerkIds)
      : { data: [], error: null };

    if (driversResult.error) throw driversResult.error;

    const { data: availableDriverRows = [], error: availableError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver')
      .eq('is_verified', true)
      .or('account_status.is.null,account_status.neq.suspended')
      .order('is_available', { ascending: false })
      .order('full_name', { ascending: true })
      .limit(100);

    if (availableError) throw availableError;

    const driverByClerkId = new Map((driversResult.data || []).map((driver) => [driver.clerk_id, formatUser(driver)]));

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking) => formatBooking(booking, driverByClerkId.get(booking.driver_id))),
      availableDrivers: availableDriverRows.map(formatUser),
    });
  } catch (error) {
    console.error('Failed to load admin bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const id = cleanString(body.id, 120);
  const status = cleanString(body.status, 40);
  const driverId = cleanString(body.driverId, 160);

  if (!id || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { success: false, message: 'Invalid booking update' },
      { status: 400 }
    );
  }

  try {
    const updates = { status };
    let assignedDriver = null;

    if (status === 'accepted') {
      if (!driverId) {
        return NextResponse.json(
          { success: false, message: 'Driver is required for assignment' },
          { status: 400 }
        );
      }

      const { data: driver, error: driverError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', driverId)
        .eq('role', 'driver')
        .eq('is_verified', true)
        .or('account_status.is.null,account_status.neq.suspended')
        .maybeSingle();

      if (driverError) throw driverError;
      if (!driver) {
        return NextResponse.json(
          { success: false, message: 'Verified active driver not found' },
          { status: 404 }
        );
      }

      assignedDriver = formatUser(driver);
      updates.driver_id = driver.clerk_id;
      updates.accepted_at = new Date().toISOString();
    }

    if (status === 'pending') {
      updates.driver_id = null;
      updates.accepted_at = null;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAdminActivity({
      action: status === 'accepted' ? 'booking.assign' : 'booking.status',
      targetType: 'booking',
      targetId: String(booking.id),
      targetLabel: booking.destination,
      summary:
        status === 'accepted'
          ? `Assigned booking to ${assignedDriver?.fullName || driverId}`
          : `Updated booking status to ${status}`,
      metadata: { status, driverId: updates.driver_id || null },
    });

    return NextResponse.json({
      success: true,
      booking: formatBooking(booking, assignedDriver),
    });
  } catch (error) {
    console.error('Failed to update admin booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
