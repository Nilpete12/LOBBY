import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request, context) {
  try {
    await connectDB();

    const params = await context.params;
    
    // ADD .lean() HERE to ensure Next.js can serialize the object perfectly
    const driver = await User.findOne({ clerkId: params.id }).lean();

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