import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    // 1. Await the async auth() to get the current user's ID
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body; // 'rider' or 'driver'

    if (!['rider', 'driver'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // 2. Initialize the Clerk client and fetch the user's details to get their name
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    
    // Combine first name and last name, or fallback to their email/username if empty
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const fallbackName = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
    const computedFullName = `${firstName} ${lastName}`.trim() || fallbackName;

    // 3. Upsert into Supabase including the new full_name column
    const { error: supabaseError } = await supabase
      .from('users')
      .upsert({ 
        clerk_id: userId, 
        full_name: computedFullName, // Saves their real name into the DB!
        role: role,
        is_verified: false,
        is_available: false
      }, { onConflict: 'clerk_id' });

    if (supabaseError) {
      console.error("Supabase Onboarding DB Error:", supabaseError);
      throw supabaseError;
    }

    // 4. Update the public metadata on Clerk's servers
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        onboardingComplete: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully registered ${computedFullName} as a ${role}` 
    });
    
  } catch (error) {
    console.error("Onboarding Catch Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to complete onboarding' }, { status: 500 });
  }
}