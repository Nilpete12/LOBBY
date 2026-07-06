import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { formatUser, formatVerificationRequest } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'superseded']);
const ALLOWED_ACTIONS = new Set(['approve', 'reject']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (ALLOWED_STATUSES.has(status)) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      requests: (data || []).map(formatVerificationRequest),
    });
  } catch (error) {
    console.error('Failed to load verification requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load verification requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const id = cleanString(body.id, 120);
  const action = cleanString(body.action, 20);
  const reviewNotes = cleanString(body.notes, 500);

  if (!id || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { success: false, message: 'Invalid verification action' },
      { status: 400 }
    );
  }

  try {
    const { data: requestRow, error: requestError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (requestError) throw requestError;
    if (!requestRow) {
      return NextResponse.json(
        { success: false, message: 'Verification request not found' },
        { status: 404 }
      );
    }

    const approved = action === 'approve';
    const nextStatus = approved ? 'approved' : 'rejected';
    const nextNote = reviewNotes || (approved ? 'Approved by admin' : 'Rejected by admin');
    const driverUpdates = {
      is_verified: approved,
      verification_status: approved ? 'Approved' : 'Rejected',
      ai_notes: nextNote,
      license_url: requestRow.license_url,
    };

    if (!approved) driverUpdates.is_available = false;

    const { data: driverRow, error: driverError } = await supabase
      .from('users')
      .update(driverUpdates)
      .eq('id', requestRow.driver_id)
      .eq('role', 'driver')
      .select()
      .single();

    if (driverError) throw driverError;

    const { data: updatedRequest, error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: nextStatus,
        review_notes: nextNote,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    await logAdminActivity({
      action: approved ? 'verification.approve' : 'verification.reject',
      targetType: 'verification_request',
      targetId: String(updatedRequest.id),
      targetLabel: updatedRequest.driver_name,
      summary: `${approved ? 'Approved' : 'Rejected'} verification for ${updatedRequest.driver_name}`,
      metadata: { driverId: String(updatedRequest.driver_id), reviewNotes: nextNote },
    });

    return NextResponse.json({
      success: true,
      request: formatVerificationRequest(updatedRequest),
      driver: formatUser(driverRow),
    });
  } catch (error) {
    console.error('Failed to update verification request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update verification request' },
      { status: 500 }
    );
  }
}
