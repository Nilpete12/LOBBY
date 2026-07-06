import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import User from '@/models/User';

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const driver = await User.findOne({ clerkId: userId, role: 'driver' }).select('-password').lean();

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = startOfDay(now);
    const week = startOfWeek(now);
    const month = startOfMonth(now);

    const [
      events,
      totalCalls,
      totalProfileViews,
      totalWhatsAppClicks,
      callsToday,
      callsThisWeek,
      profileViewsThisMonth,
      callClicksThisMonth,
      whatsappClicksThisMonth,
    ] = await Promise.all([
      Analytics.find({ driverId: driver._id, type: { $in: ['call_click', 'whatsapp_click'] } })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean(),
      Analytics.countDocuments({ type: 'call_click', driverId: driver._id }),
      Analytics.countDocuments({ type: 'profile_view', driverId: driver._id }),
      Analytics.countDocuments({ type: 'whatsapp_click', driverId: driver._id }),
      Analytics.countDocuments({ type: 'call_click', driverId: driver._id, timestamp: { $gte: today } }),
      Analytics.countDocuments({ type: 'call_click', driverId: driver._id, timestamp: { $gte: week } }),
      Analytics.countDocuments({ type: 'profile_view', driverId: driver._id, timestamp: { $gte: month } }),
      Analytics.countDocuments({ type: 'call_click', driverId: driver._id, timestamp: { $gte: month } }),
      Analytics.countDocuments({ type: 'whatsapp_click', driverId: driver._id, timestamp: { $gte: month } }),
    ]);

    const riderIds = [...new Set(events.map((event) => event.riderId).filter(Boolean))];
    const riders = await User.find({ clerkId: { $in: riderIds } }).select('clerkId fullName email').lean();
    const riderByClerkId = new Map(riders.map((rider) => [rider.clerkId, rider]));

    const history = events.map((event) => ({
      _id: String(event._id),
      type: event.type,
      timestamp: event.timestamp,
      rider: event.riderId
        ? riderByClerkId.get(event.riderId) || { fullName: 'Rider', email: '' }
        : { fullName: 'Guest rider', email: '' },
    }));

    return NextResponse.json({
      success: true,
      driver,
      stats: {
        totalCalls,
        totalProfileViews,
        totalWhatsAppClicks,
        callsToday,
        callsThisWeek,
        profileViewsThisMonth,
        callClicksThisMonth,
        whatsappClicksThisMonth,
      },
      history,
    });
  } catch (error) {
    console.error('Failed to load driver history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load driver history' },
      { status: 500 }
    );
  }
}
