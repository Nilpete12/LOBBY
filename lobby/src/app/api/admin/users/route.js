import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to load admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load users' },
      { status: 500 }
    );
  }
}
