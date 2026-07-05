import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationRequest from '@/models/VerificationRequest';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function DELETE(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user id' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin users cannot be deleted here' },
        { status: 403 }
      );
    }

    const verificationCleanupQuery = [{ driverId: user._id }];
    if (user.clerkId) verificationCleanupQuery.push({ clerkId: user.clerkId });

    await Promise.all([
      User.deleteOne({ _id: id }),
      VerificationRequest.deleteMany({
        $or: verificationCleanupQuery,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
