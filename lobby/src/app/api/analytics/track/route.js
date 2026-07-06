import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { rateLimit } from '@/lib/rateLimit';

const ALLOWED_EVENT_TYPES = new Set(['profile_view', 'call_click', 'whatsapp_click']);

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'analytics-track',
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (limited) return limited;

  try {
    const { userId } = await auth();
    const body = await request.json();

    if (!ALLOWED_EVENT_TYPES.has(body.type)) {
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
      type: body.type,
      driverId: body.driverId,
      riderId: userId || undefined,
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
