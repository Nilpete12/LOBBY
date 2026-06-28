import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await request.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user id' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const driver = await User.findOneAndUpdate(
      { _id: id, role: 'driver' },
      {
        $set: {
          isVerified: true,
          verificationStatus: 'Approved',
          aiNotes: 'Approved by admin',
        },
      },
      { new: true }
    ).select('-password');

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, driver });
  } catch (error) {
    console.error('Failed to approve driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve driver' },
      { status: 500 }
    );
  }
}
