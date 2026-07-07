import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { syncClerkUserToSupabase } from '@/lib/clerkUserSync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function onboardingJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return onboardingJson({ success: false, error: 'Please sign in again before choosing an account type.' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!['rider', 'driver'].includes(role)) {
      return onboardingJson({ success: false, error: 'Choose rider or driver to continue.' }, { status: 400 });
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

    return onboardingJson({
      success: true,
      message: `Successfully registered ${user.full_name || 'user'} as a ${role}`,
    });
  } catch (error) {
    console.error("Onboarding Catch Error:", error);
    return onboardingJson(
      { success: false, error: 'Failed to complete onboarding. Please try again.' },
      { status: 500 }
    );
  }
}
