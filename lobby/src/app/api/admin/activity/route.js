import { NextResponse } from 'next/server';
import connectDB from '@/lib/supabase';
import AdminActivityLog from '@/models/AdminActivityLog';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await connectDB();
    const logs = await AdminActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Failed to load admin activity:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load admin activity' },
      { status: 500 }
    );
  }
}
