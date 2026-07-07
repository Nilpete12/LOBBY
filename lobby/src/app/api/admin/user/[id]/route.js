import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';

export async function POST(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const body = await req.json();
    const { clerkId } = body; // Pass the clerkId of the driver being verified

    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'Missing user identifier' }, { status: 400 });
    }

    // Update the column name to snake_case 'is_verified' in Supabase
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('clerk_id', clerkId);

    if (error) {
      console.error("Supabase verification error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Driver verified successfully' });

  } catch (error) {
    console.error("Verification endpoint crash:", error);
    return NextResponse.json({ success: false, error: 'Failed to verify driver' }, { status: 500 });
  }
}