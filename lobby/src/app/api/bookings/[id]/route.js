import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

const DRIVER_FIELDS = 'clerkId fullName phone vehicle profilePic carPic rating';

function serializeBooking(booking, { includeRiderPhone = false, driver = null } = {}) {
  return {
    _id: booking._id,
    riderId: booking.riderId,
    riderName: booking.riderName,
    ...(includeRiderPhone ? { riderPhone: booking.riderPhone } : {}),
    driverId: booking.driverId,
    pickupLocation: booking.pickupLocation,
    locationUpdatedAt: booking.locationUpdatedAt,
    destination: booking.destination,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    acceptedAt: booking.acceptedAt,
    driver: driver
      ? {
          clerkId: driver.clerkId,
          fullName: driver.fullName,
          phone: driver.phone || '',
          vehicle: driver.vehicle || '',
          profilePic: driver.profilePic || '',
          carPic: driver.carPic || '',
          rating: driver.rating || 5,
        }
      : null,
  };
}

async function getViewer(userId) {
  return User.findOne({ clerkId: userId })
    .select('clerkId role isVerified isAvailable')
    .lean();
}

export async function GET(req, context) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking id' },
        { status: 400 }
      );
    }

    await connectMongo();

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const isRider = booking.riderId === userId;
    const isAssignedDriver = booking.driverId === userId;

    if (!isRider && !isAssignedDriver) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const driver = booking.driverId
      ? await User.findOne({ clerkId: booking.driverId }).select(DRIVER_FIELDS).lean()
      : null;

    return NextResponse.json({
      success: true,
      booking: serializeBooking(booking, {
        includeRiderPhone: isAssignedDriver,
        driver,
      }),
    });
    
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, context) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking id' },
        { status: 400 }
      );
    }

    await connectMongo();

    const body = await req.json();
    const status = body.status;

    if (!['accepted', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status' },
        { status: 400 }
      );
    }

    const viewer = await getViewer(userId);

    if (status === 'accepted') {
      if (!viewer || viewer.role !== 'driver' || !viewer.isVerified || !viewer.isAvailable) {
        return NextResponse.json(
          { success: false, message: 'Only verified online drivers can accept rides' },
          { status: 403 }
        );
      }

      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: id, status: 'pending' },
        {
          $set: {
            status: 'accepted',
            driverId: userId,
            acceptedAt: new Date(),
          },
        },
        { new: true }
      ).lean();

      if (!updatedBooking) {
        return NextResponse.json(
          { success: false, message: 'Booking is no longer available' },
          { status: 409 }
        );
      }

      const driver = await User.findOne({ clerkId: userId }).select(DRIVER_FIELDS).lean();

      return NextResponse.json({
        success: true,
        booking: serializeBooking(updatedBooking, {
          includeRiderPhone: true,
          driver,
        }),
      });
    }

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const isRider = booking.riderId === userId;
    const isAssignedDriver = booking.driverId === userId;

    if (status === 'completed' && !isAssignedDriver) {
      return NextResponse.json(
        { success: false, message: 'Only the assigned driver can complete this ride' },
        { status: 403 }
      );
    }

    if (status === 'cancelled' && !isRider && !isAssignedDriver) {
      return NextResponse.json(
        { success: false, message: 'Only the rider or assigned driver can cancel this ride' },
        { status: 403 }
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();

    const driver = updatedBooking.driverId
      ? await User.findOne({ clerkId: updatedBooking.driverId }).select(DRIVER_FIELDS).lean()
      : null;

    return NextResponse.json({
      success: true,
      booking: serializeBooking(updatedBooking, {
        includeRiderPhone: isAssignedDriver,
        driver,
      }),
    });
    
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
