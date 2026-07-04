import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import User from '@/models/User';

const RIDER_HISTORY_DRIVER_FIELDS = 'fullName phone vehicle profilePic carPic rating';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const events = await Analytics.find({ type: 'call_click', riderId: userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const latestByDriver = new Map();
    for (const event of events) {
      const driverKey = String(event.driverId);
      if (!latestByDriver.has(driverKey)) {
        latestByDriver.set(driverKey, event.timestamp);
      }
    }

    const driverIds = Array.from(latestByDriver.keys());
    const drivers = await User.find({ _id: { $in: driverIds } })
      .select(RIDER_HISTORY_DRIVER_FIELDS)
      .lean();
    const driverById = new Map(drivers.map((driver) => [String(driver._id), driver]));

    const history = driverIds
      .map((driverId) => {
        const driver = driverById.get(driverId);
        return driver ? { ...driver, lastCalled: latestByDriver.get(driverId) } : null;
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Failed to load rider history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load history' },
      { status: 500 }
    );
  }
}
