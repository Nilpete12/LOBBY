import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request, context) {
  try {
    await connectDB();

    const params = await context.params;
    
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
    console.error("CRASH DETAILS:", error.message, error.stack); 
    
    return NextResponse.json(
      { success: false, message: `Backend crashed: ${error.message}` }, 
      { status: 500 }
    );
  }
}// <--- This final bracket is what went missing!