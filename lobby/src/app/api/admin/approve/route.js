import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';

export async function POST(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const body = await req.json();
    const { clerkId, action } = body; // action: 'approve' or 'reject'

    if (!clerkId) {
      return NextResponse.json({ success: false, message: 'Driver clerkId required' }, { status: 400 });
    }

    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'Approved' : 'Rejected';

    // Update Postgres driver record
    const { data: updatedDriver, error } = await supabase
      .from('users')
      .update({
        is_verified: isApproved,
        verification_status: newStatus
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) throw error;

    const formattedDriver = {
      ...updatedDriver,
      _id: updatedDriver.id,
      clerkId: updatedDriver.clerk_id,
      fullName: updatedDriver.full_name,
      isVerified: updatedDriver.is_verified,
      verificationStatus: updatedDriver.verification_status
    };

    return NextResponse.json({ success: true, driver: formattedDriver });
  } catch (error) {
    console.error("Admin Approval Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to update driver status' }, { status: 500 });
  }
}