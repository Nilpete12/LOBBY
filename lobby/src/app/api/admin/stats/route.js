import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminActivityLog from '@/models/AdminActivityLog';
import Analytics from '@/models/Analytics';
import Booking from '@/models/Bookings';
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
      suspendedUsers,
      totalCalls,
      bookingStatusRows,
      topDestinationRows,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'driver', isAvailable: true }),
      User.countDocuments({ role: 'driver', isVerified: false, licenseUrl: { $exists: true, $ne: '' } }),
      VerificationRequest.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: { $ne: 'resolved' } }),
      User.countDocuments({ accountStatus: 'suspended' }),
      Analytics.countDocuments({ type: 'call_click' }),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Booking.aggregate([
        { $group: { _id: '$destination', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      AdminActivityLog.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const bookingStatus = bookingStatusRows.reduce(
      (acc, row) => ({ ...acc, [row._id || 'unknown']: row.count }),
      {}
    );
    const topDestinations = topDestinationRows.map((row) => ({
      destination: row._id || 'Unknown',
      count: row.count,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        pendingDrivers,
        pendingVerificationRequests,
        pendingComplaints,
        suspendedUsers,
        totalCalls,
        bookingStatus,
        topDestinations,
        recentActivity,
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
