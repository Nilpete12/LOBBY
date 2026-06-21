import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// The { params } object automatically captures the [id] from the folder name!
export async function GET(request, { params }) {
  try {
    await connectDB();

    // Search MongoDB using the clerkId we passed in the URL
    const driver = await User.findOne({ clerkId: params.id });

    if (!driver) {
      return NextResponse.json(
        { success: false, message: "Driver profile not found in database." }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, driver }, { status: 200 });

  } catch (error) {
    console.error("Fetch Driver Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch driver data" }, 
      { status: 500 }
    );
  }
}