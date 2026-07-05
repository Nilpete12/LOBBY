import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import VerificationRequest from '@/models/VerificationRequest';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await connectDB();

    const [
      totalUsers,
      totalDrivers,
      activeDrivers,
      pendingDrivers,
      pendingVerificationRequests,
      pendingComplaints,
      totalCalls,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'driver', isAvailable: true }),
      User.countDocuments({ role: 'driver', isVerified: false, licenseUrl: { $exists: true, $ne: '' } }),
      VerificationRequest.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'pending' }),
      Analytics.countDocuments({ type: 'call_click' }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        pendingDrivers,
        pendingVerificationRequests,
        pendingComplaints,
        totalCalls,
      },
    });
  } catch (error) {
    console.error('Failed to load admin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load stats' },
      { status: 500 }
    );
  }
}
