import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

function sanitizeIncomingBooking(booking) {
  return {
    _id: booking._id,
    riderName: booking.riderName,
    pickupLocation: booking.pickupLocation,
    destination: booking.destination,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongo();

    const driver = await User.findOne({ clerkId: userId, role: 'driver' })
      .select('isAvailable isVerified')
      .lean();

    if (!driver || !driver.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Verified driver access required' },
        { status: 403 }
      );
    }

    if (!driver.isAvailable) {
      return NextResponse.json({ success: true, bookings: [] });
    }

    const pendingBookings = await Booking.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      bookings: pendingBookings.map(sanitizeIncomingBooking),
    });
    
  } catch (error) {
    console.error("Incoming Bookings Error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch incoming bookings' },
      { status: 500 }
    );
  }
}
