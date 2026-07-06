import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body; // 'rider' or 'driver'

    if (!['rider', 'driver'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 1. Update Supabase
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ role: role })
      .eq('clerk_id', userId);

    if (supabaseError) throw supabaseError;

    // 2. Update Clerk publicMetadata so the frontend knows their role
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        onboardingComplete: true
      }
    });

    return NextResponse.json({ success: true, message: `Successfully registered as ${role}` });

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}