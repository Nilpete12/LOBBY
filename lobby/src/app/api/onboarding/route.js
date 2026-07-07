import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { syncClerkUserToSupabase } from '@/lib/clerkUserSync';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!['rider', 'driver'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        onboardingComplete: true,
      },
    });

    const clerkUser = await client.users.getUser(userId);
    const { user } = await syncClerkUserToSupabase(clerkUser, { role });

    // Keep this explicit update as a final guard in case metadata propagation lags.
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ role })
      .eq('clerk_id', userId);

    if (supabaseError) throw supabaseError;

    return NextResponse.json({
      success: true,
      message: `Successfully registered ${user.full_name || 'user'} as a ${role}`,
    });
  } catch (error) {
    console.error("Onboarding Catch Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
