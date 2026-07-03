import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function DELETE() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await connectDB();
    const result = await Analytics.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    console.error('Failed to reset analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset analytics data' },
      { status: 500 }
    );
  }
}
