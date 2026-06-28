import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.clerkId && body.clerkId !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const updates = {
      vehicle: typeof body.vehicle === 'string' ? body.vehicle.trim().slice(0, 120) : '',
      phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '',
      routes: Array.isArray(body.routes)
        ? body.routes.map((route) => String(route).trim()).filter(Boolean).slice(0, 20)
        : [],
      isAvailable: Boolean(body.isAvailable),
    };

    await connectDB();

    const driver = await User.findOneAndUpdate(
      { clerkId: userId, role: 'driver' },
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, driver });
  } catch (error) {
    console.error('Failed to update driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update driver profile' },
      { status: 500 }
    );
  }
}
