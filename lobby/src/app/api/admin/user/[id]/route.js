import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
