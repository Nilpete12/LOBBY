import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    await connectMongo();
    
    // 1. Verify the user is logged in
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Grab the ride data from the frontend request
    const body = await req.json();
    const { pickupLocation, destination, riderName, riderPhone } = body;

    // 3. Create the new pending booking
    const newBooking = await Booking.create({
      riderId: userId,
      riderName,
      riderPhone,
      pickupLocation,
      destination,
      status: 'pending'
    });

    return NextResponse.json({ success: true, booking: newBooking });
    
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}