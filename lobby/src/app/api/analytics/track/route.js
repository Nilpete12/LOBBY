import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type !== 'call_click') {
      return NextResponse.json(
        { success: false, message: 'Unsupported analytics event' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.driverId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid driver id' },
        { status: 400 }
      );
    }

    await connectDB();

    await Analytics.create({
      type: 'call_click',
      driverId: body.driverId,
      riderId: typeof body.riderId === 'string' ? body.riderId : undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track event' },
      { status: 500 }
    );
  }
}
