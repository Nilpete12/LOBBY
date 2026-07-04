import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import User from '@/models/User';
import { auth, currentUser } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanPhone(value) {
  return cleanString(value, 32).replace(/[^\d+\s-]/g, '');
}

function getValidPickupLocation(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return {
    lat,
    lng,
    address: cleanString(value?.address, 180) || 'Current Location',
  };
}

export async function POST(req) {
  const limited = rateLimit(req, {
    keyPrefix: 'bookings-create',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (limited) return limited;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongo();

    const [clerkUser, riderProfile] = await Promise.all([
      currentUser(),
      User.findOne({ clerkId: userId }).select('fullName phone role').lean(),
    ]);

    if (riderProfile?.role === 'driver') {
      return NextResponse.json(
        { success: false, message: 'Driver accounts cannot create rider bookings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const pickupLocation = getValidPickupLocation(body.pickupLocation);
    const destination = cleanString(body.destination, 160);
    const riderPhone = cleanPhone(
      riderProfile?.phone ||
      clerkUser?.primaryPhoneNumber?.phoneNumber ||
      body.riderPhone
    );

    if (!pickupLocation) {
      return NextResponse.json(
        { success: false, message: 'A valid pickup location is required' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { success: false, message: 'Destination is required' },
        { status: 400 }
      );
    }

    if (riderPhone.replace(/\D/g, '').length < 7) {
      return NextResponse.json(
        { success: false, message: 'A valid phone number is required for instant booking' },
        { status: 400 }
      );
    }

    const newBooking = await Booking.create({
      riderId: userId,
      riderName:
        riderProfile?.fullName ||
        clerkUser?.fullName ||
        clerkUser?.firstName ||
        'Rider',
      riderPhone,
      pickupLocation,
      destination,
      status: 'pending',
    });

    return NextResponse.json({ success: true, booking: newBooking });
    
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
