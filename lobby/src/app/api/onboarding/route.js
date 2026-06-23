import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();
    if (role !== 'rider' && role !== 'driver') {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }

    // 1. Fetch user details from Clerk so MongoDB doesn't crash from missing fields!
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User';

    // 2. Connect to DB
    await connectDB();
    
    // 3. Upsert with ALL required Mongoose fields
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: { 
          clerkId: userId,
          role: role,
          email: email,
          fullName: fullName
        }
      },
      { new: true, upsert: true } // Now it has all the data it needs to create the doc!
    );

    // 4. Update Clerk's internal Metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: role }
    });

    return NextResponse.json({ success: true, message: "Role updated successfully" });

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" }, 
      { status: 500 }
    );
  }
}