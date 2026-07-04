import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const PUBLIC_DRIVER_FIELDS = 'fullName phone vehicle routes rating profilePic carPic';
const OWNER_DRIVER_FIELDS = '-password -__v';

export async function GET(request, context) {
  try {
    await connectDB();

    const { userId } = await auth();
    const params = await context.params;
    const isOwner = userId === params.id;
    const query = isOwner
      ? { clerkId: params.id, role: 'driver' }
      : { clerkId: params.id, role: 'driver', isAvailable: true, isVerified: true };
    const projection = isOwner ? OWNER_DRIVER_FIELDS : PUBLIC_DRIVER_FIELDS;

    const driver = await User.findOne(query).select(projection).lean();

    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Driver profile not found in database." }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, driver }, { status: 200 });
  } catch (error) {
    console.error("Driver lookup failed:", error);
    
    return NextResponse.json(
      { success: false, message: "Unable to load driver profile" },
      { status: 500 }
    );
  }
}
