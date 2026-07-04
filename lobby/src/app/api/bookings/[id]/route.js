import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(req, { params }) {
  try {
    await connectMongo();
    
    // Find the specific booking using the ID from the URL
    const booking = await Booking.findById(params.id).lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
    
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// Add this to the bottom of src/app/api/bookings/[id]/route.js

export async function PATCH(req, { params }) {
  try {
    await connectMongo();
    
    const body = await req.json();
    const { status, driverId } = body;

    // Update the booking with the new status and the driver's ID
    const updatedBooking = await Booking.findByIdAndUpdate(
      params.id,
      { status, driverId },
      { new: true } // Returns the updated document
    ).lean();

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
    
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}