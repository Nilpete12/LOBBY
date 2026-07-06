import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

const ALLOWED_STATUSES = new Set(['pending', 'accepted', 'completed', 'cancelled']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function serializeDriver(driver) {
  if (!driver) return null;
  return {
    _id: driver._id,
    clerkId: driver.clerkId,
    fullName: driver.fullName,
    phone: driver.phone || '',
    vehicle: driver.vehicle || '',
    isAvailable: Boolean(driver.isAvailable),
    isVerified: Boolean(driver.isVerified),
    accountStatus: driver.accountStatus || 'active',
  };
}

function serializeBooking(booking, driverByClerkId = new Map()) {
  const driver = booking.driverId ? driverByClerkId.get(booking.driverId) : null;
  return {
    _id: booking._id,
    riderId: booking.riderId,
    riderName: booking.riderName,
    riderPhone: booking.riderPhone,
    driverId: booking.driverId,
    driver: serializeDriver(driver),
    pickupLocation: booking.pickupLocation,
    destination: booking.destination,
    status: booking.status,
    acceptedAt: booking.acceptedAt,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { searchParams } = new URL(request.url);
  const status = cleanString(searchParams.get('status'), 40);
  const query = ALLOWED_STATUSES.has(status) ? { status } : {};

  try {
    await connectDB();

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const driverIds = [...new Set(bookings.map((booking) => booking.driverId).filter(Boolean))];
    const [drivers, availableDrivers] = await Promise.all([
      driverIds.length
        ? User.find({ clerkId: { $in: driverIds } })
            .select('clerkId fullName phone vehicle isAvailable isVerified accountStatus')
            .lean()
        : [],
      User.find({
        role: 'driver',
        isVerified: true,
        accountStatus: { $ne: 'suspended' },
      })
        .sort({ isAvailable: -1, fullName: 1 })
        .select('clerkId fullName phone vehicle isAvailable isVerified accountStatus')
        .limit(100)
        .lean(),
    ]);

    const driverByClerkId = new Map(drivers.map((driver) => [driver.clerkId, driver]));

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking) => serializeBooking(booking, driverByClerkId)),
      availableDrivers: availableDrivers.map(serializeDriver),
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

  const id = cleanString(body.id, 80);
  const status = cleanString(body.status, 40);
  const driverId = cleanString(body.driverId, 160);

  if (!mongoose.Types.ObjectId.isValid(id) || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { success: false, message: 'Invalid booking update' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const updates = { status };
    let assignedDriver = null;

    if (status === 'accepted') {
      if (!driverId) {
        return NextResponse.json(
          { success: false, message: 'Driver is required for assignment' },
          { status: 400 }
        );
      }

      assignedDriver = await User.findOne({
        clerkId: driverId,
        role: 'driver',
        isVerified: true,
        accountStatus: { $ne: 'suspended' },
      }).select('clerkId fullName phone vehicle isAvailable isVerified accountStatus');

      if (!assignedDriver) {
        return NextResponse.json(
          { success: false, message: 'Verified active driver not found' },
          { status: 404 }
        );
      }

      updates.driverId = assignedDriver.clerkId;
      updates.acceptedAt = new Date();
    }

    if (status === 'pending') {
      updates.driverId = null;
      updates.acceptedAt = null;
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    await logAdminActivity({
      action: status === 'accepted' ? 'booking.assign' : 'booking.status',
      targetType: 'booking',
      targetId: String(booking._id),
      targetLabel: booking.destination,
      summary:
        status === 'accepted'
          ? `Assigned booking to ${assignedDriver?.fullName || driverId}`
          : `Updated booking status to ${status}`,
      metadata: { status, driverId: updates.driverId || null },
    });

    const driverMap = new Map();
    if (booking.driverId) {
      const driver = assignedDriver?.toObject
        ? assignedDriver.toObject()
        : await User.findOne({ clerkId: booking.driverId })
            .select('clerkId fullName phone vehicle isAvailable isVerified accountStatus')
            .lean();
      if (driver) driverMap.set(driver.clerkId, driver);
    }

    return NextResponse.json({
      success: true,
      booking: serializeBooking(booking, driverMap),
    });
  } catch (error) {
    console.error('Failed to update admin booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
