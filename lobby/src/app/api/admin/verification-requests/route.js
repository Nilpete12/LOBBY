import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REVIEW_OPTIONAL_COLUMNS = new Set(['review_notes', 'reviewed_at']);
const USER_REVIEW_OPTIONAL_COLUMNS = new Set(['verification_status', 'is_available']);

function adminJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeStatus(status) {
  return cleanString(status, 40).toLowerCase() || 'pending';
}

function formatRequest(req = {}) {
  const id = req.id || `user:${req.driver_id || req.clerk_id}`;

  return {
    ...req,
    id,
    _id: id,
    driverId: req.driver_id,
    clerkId: req.clerk_id,
    driverName: req.driver_name || req.full_name || 'Driver',
    email: req.email || '',
    phone: req.phone || '',
    vehicle: req.vehicle || '',
    licenseUrl: req.license_url || '',
    status: normalizeStatus(req.status),
    createdAt: req.created_at || req.updated_at,
    updatedAt: req.updated_at,
    reviewNotes: req.review_notes || '',
    reviewedAt: req.reviewed_at,
  };
}

function requestFromUser(user = {}) {
  return formatRequest({
    id: `user:${user.id || user.clerk_id}`,
    driver_id: user.id,
    clerk_id: user.clerk_id,
    driver_name: user.full_name,
    email: user.email,
    phone: user.phone,
    vehicle: user.vehicle,
    license_url: user.license_url,
    status: user.status || 'pending',
    review_notes: user.review_notes,
    reviewed_at: user.reviewed_at,
    created_at: user.updated_at || user.created_at,
    updated_at: user.updated_at,
  });
}

async function getUser(identifier) {
  if (!identifier) return null;

  const byClerk = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', identifier)
    .maybeSingle();

  if (byClerk.error) throw byClerk.error;
  if (byClerk.data) return byClerk.data;

  const byId = await supabase
    .from('users')
    .select('*')
    .eq('id', identifier)
    .maybeSingle();

  if (byId.error) throw byId.error;
  return byId.data;
}

async function loadPendingDriverUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'driver')
    .eq('is_verified', false)
    .not('license_url', 'is', null);

  if (error) throw error;

  return (data || [])
    .filter((user) => {
      const status = normalizeStatus(user.verification_status);
      return user.license_url && !['approved', 'rejected'].includes(status);
    })
    .map(requestFromUser);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const tableResult = await supabase
      .from('verification_requests')
      .select('*')
      .in('status', ['pending', 'Pending'])
      .order('created_at', { ascending: false });

    let requests = [];
    let tableError = tableResult.error;

    if (!tableError) {
      requests = (tableResult.data || []).map(formatRequest);
    } else {
      console.error('Verification request table fetch failed:', tableError);
    }

    try {
      const derivedRequests = await loadPendingDriverUsers();
      const seen = new Set(requests.map((request) => request.clerkId).filter(Boolean));
      requests = [
        ...requests,
        ...derivedRequests.filter((request) => !seen.has(request.clerkId)),
      ];
    } catch (derivedError) {
      console.error('Derived verification request fetch failed:', derivedError);
      if (tableError) throw tableError;
    }

    requests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const seenRequestKeys = new Set();
    requests = requests.filter((request) => {
      const key = request.clerkId || request.driverId || request.id;
      if (seenRequestKeys.has(key)) return false;
      seenRequestKeys.add(key);
      return true;
    });

    return adminJson({ success: true, requests });
  } catch (error) {
    console.error('Verification fetch error:', error);
    return adminJson({ success: false, message: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const id = cleanString(body.id, 160);
  const action = cleanString(body.action, 20);
  const notes = cleanString(body.notes, 500);

  if (!id || !['approve', 'reject'].includes(action)) {
    return adminJson({ success: false, message: 'Invalid verification action' }, { status: 400 });
  }

  const isApproved = action === 'approve';
  const requestStatus = isApproved ? 'approved' : 'rejected';
  const userStatus = isApproved ? 'Approved' : 'Rejected';

  try {
    let verificationRequest = null;
    let user = null;

    if (id.startsWith('user:')) {
      user = await getUser(id.slice(5));
    } else {
      const requestResult = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (requestResult.error) throw requestResult.error;
      verificationRequest = requestResult.data;

      user = await getUser(verificationRequest?.clerk_id || verificationRequest?.driver_id);
    }

    if (!verificationRequest && !user) {
      return adminJson({ success: false, message: 'Verification request not found' }, { status: 404 });
    }

    if (verificationRequest?.id) {
      verificationRequest = await writeWithColumnFallback(
        {
          status: requestStatus,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        },
        REVIEW_OPTIONAL_COLUMNS,
        (row) =>
          supabase
            .from('verification_requests')
            .update(row)
            .eq('id', verificationRequest.id)
            .select()
            .single()
      );
    }

    if (user) {
      const userUpdates = {
        is_verified: isApproved,
        verification_status: userStatus,
        ...(isApproved ? {} : { is_available: false }),
      };

      const userIdentifierColumn = user.clerk_id ? 'clerk_id' : 'id';
      const userIdentifierValue = user.clerk_id || user.id;

      await writeWithColumnFallback(userUpdates, USER_REVIEW_OPTIONAL_COLUMNS, (row) =>
        supabase
          .from('users')
          .update(row)
          .eq(userIdentifierColumn, userIdentifierValue)
          .select()
          .single()
      );
    }

    const responseRequest = verificationRequest
      ? formatRequest(verificationRequest)
      : requestFromUser({
          ...user,
          is_verified: isApproved,
          verification_status: userStatus,
          status: requestStatus,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        });

    await logAdminActivity({
      action: `verification.${action}`,
      targetType: 'verification_request',
      targetId: String(responseRequest.id),
      targetLabel: responseRequest.driverName,
      summary: `${isApproved ? 'Approved' : 'Rejected'} verification for ${responseRequest.driverName}`,
      metadata: { notes },
    });

    return adminJson({ success: true, request: responseRequest });
  } catch (error) {
    console.error('Verification update error:', error);
    return adminJson({ success: false, message: 'Failed to update verification request' }, { status: 500 });
  }
}
