import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';
import { formatUser } from '@/lib/supabaseFormat';

export async function POST(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const body = await req.json();
    const { id, clerkId, action = 'approve' } = body; // action: 'approve' or 'reject'

    if (!id && !clerkId) {
      return NextResponse.json({ success: false, message: 'Driver id required' }, { status: 400 });
    }

    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'Approved' : 'Rejected';

    // Update Postgres driver record
    let query = supabase
      .from('users')
      .update({
        is_verified: isApproved,
        verification_status: newStatus
      })
      .eq('role', 'driver');

    query = id ? query.eq('id', id) : query.eq('clerk_id', clerkId);

    const { data: updatedDriver, error } = await query.select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, driver: formatUser(updatedDriver) });
  } catch (error) {
    console.error("Admin Approval Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to update driver status' }, { status: 500 });
  }
}
