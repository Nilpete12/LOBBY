import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/supabase';
import Booking from '@/models/Bookings';

function getValidLocation(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

export async function POST(req, context) {
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

    const body = await req.json();
    const location = getValidLocation(body);

    if (!location) {
      return NextResponse.json(
        { success: false, message: 'A valid location is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        riderId: userId,
        status: { $in: ['pending', 'accepted'] },
      },
      {
        $set: {
          'pickupLocation.lat': location.lat,
          'pickupLocation.lng': location.lng,
          'pickupLocation.address': 'Live pickup location',
          locationUpdatedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking is not available for live location updates' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking Location Update Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking location' },
      { status: 500 }
    );
  }
}
