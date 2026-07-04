import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Booking from '@/models/Bookings';

export async function GET(req) {
  try {
    await connectMongo();
    
    // Fetch all bookings that are currently waiting for a driver
    // We sort by createdAt -1 so the newest requests show up first
    const pendingBookings = await Booking.find({ status: 'pending' })
                                         .sort({ createdAt: -1 })
                                         .lean();

    return NextResponse.json({ success: true, bookings: pendingBookings });
    
  } catch (error) {
    console.error("Incoming Bookings Error:", error);
    return NextResponse.json({ error: 'Failed to fetch incoming bookings' }, { status: 500 });
  }
}