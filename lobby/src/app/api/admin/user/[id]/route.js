import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import {
  formatBooking,
  formatUser,
  formatVerificationRequest,
  userUpdatesToRow,
} from '@/lib/supabaseFormat';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { deleteClerkUserAccount, updateClerkUserRole } from '@/lib/clerkUserSync';
import { TAXI_STAND_NAMES } from '@/lib/taxiStands';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PROFILE_OPTIONAL_COLUMNS = new Set(['ai_notes', 'taxi_stands', 'vehicle_plate']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function adminJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function cleanRoutes(value) {
  if (Array.isArray(value)) {
    return value.map((route) => cleanString(route, 80)).filter(Boolean).slice(0, 20);
  }

  if (typeof value === 'string') {
    return value.split(',').map((route) => cleanString(route, 80)).filter(Boolean).slice(0, 20);
  }

  return [];
}

function cleanTaxiStands(value) {
  const allowed = new Map(TAXI_STAND_NAMES.map((name) => [name.toLowerCase(), name]));
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(
    raw
      .map((stand) => cleanString(stand, 80))
      .map((stand) => allowed.get(stand.toLowerCase()))
      .filter(Boolean)
  )].slice(0, TAXI_STAND_NAMES.length);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

async function getUser(identifier) {
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

export async function GET(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  try {
    const user = await getUser(id);

    if (!user) {
      return adminJson(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const verificationFilter = user.clerk_id
      ? `driver_id.eq.${user.id},clerk_id.eq.${user.clerk_id}`
      : `driver_id.eq.${user.id}`;

    const verificationQuery = supabase
      .from('verification_requests')
      .select('*')
      .or(verificationFilter)
      .order('created_at', { ascending: false })
      .limit(20);

    const bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .or(`rider_id.eq.${user.clerk_id},driver_id.eq.${user.clerk_id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    const [verificationResult, bookingsResult] = await Promise.all([
      verificationQuery,
      user.clerk_id ? bookingsQuery : { data: [], error: null },
    ]);

    if (verificationResult.error) throw verificationResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    return adminJson({
      success: true,
      user: formatUser(user),
      verificationRequests: (verificationResult.data || []).map(formatVerificationRequest),
      bookings: (bookingsResult.data || []).map((booking) => formatBooking(booking)),
    });
  } catch (error) {
    console.error('Failed to load user:', error);
    return adminJson(
      { success: false, message: 'Error fetching user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const action = cleanString(body.action, 40) || 'update';

  try {
    const user = await getUser(id);

    if (!user) {
      return adminJson(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return adminJson(
        { success: false, message: 'Admin users cannot be changed here' },
        { status: 403 }
      );
    }

    const updates = {};

    if (action === 'suspend') {
      updates.accountStatus = 'suspended';
      updates.isAvailable = false;
      updates.suspendedAt = new Date().toISOString();
      updates.suspensionReason = cleanString(body.reason, 500) || 'Suspended by admin';
    } else if (action === 'unsuspend') {
      updates.accountStatus = 'active';
      updates.suspendedAt = null;
      updates.suspensionReason = '';
    } else if (action === 'set_availability') {
      if (user.role !== 'driver') {
        return adminJson(
          { success: false, message: 'Only driver availability can be changed' },
          { status: 400 }
        );
      }

      if (user.account_status === 'suspended') {
        return adminJson(
          { success: false, message: 'Suspended drivers cannot be made available' },
          { status: 400 }
        );
      }

      updates.isAvailable = Boolean(body.isAvailable);
    } else if (action === 'mark_subscription_paid') {
      if (user.role !== 'driver') {
        return adminJson(
          { success: false, message: 'Only driver subscriptions can be changed' },
          { status: 400 }
        );
      }

      const months = Math.min(12, Math.max(1, Number(body.months) || 1));
      const paidAt = new Date();
      updates.subscriptionStatus = 'paid';
      updates.subscriptionPaidAt = paidAt.toISOString();
      updates.subscriptionPaidUntil = addMonths(paidAt, months).toISOString();
    } else if (action === 'mark_subscription_unpaid') {
      if (user.role !== 'driver') {
        return adminJson(
          { success: false, message: 'Only driver subscriptions can be changed' },
          { status: 400 }
        );
      }

      updates.subscriptionStatus = 'unpaid';
      updates.subscriptionPaidAt = null;
      updates.subscriptionPaidUntil = null;
    } else if (action === 'set_role') {
      const nextRole = cleanString(body.role, 20);
      if (!['rider', 'driver'].includes(nextRole)) {
        return adminJson(
          { success: false, message: 'Invalid user role' },
          { status: 400 }
        );
      }

      updates.role = nextRole;
      updates.isAvailable = false;

      if (nextRole === 'driver') {
        updates.isVerified = false;
        updates.verificationStatus = user.license_url ? 'Pending' : 'Incomplete';
        updates.subscriptionStatus = user.subscription_status || 'unpaid';
      } else {
        updates.isVerified = false;
        updates.verificationStatus = 'Approved';
        updates.subscriptionStatus = null;
        updates.subscriptionPaidAt = null;
        updates.subscriptionPaidUntil = null;
      }
    } else {
      if (typeof body.fullName === 'string') updates.fullName = cleanString(body.fullName, 160);
      if (typeof body.phone === 'string') updates.phone = cleanString(body.phone, 40);
      if (typeof body.vehicle === 'string') updates.vehicle = cleanString(body.vehicle, 120);
      if (typeof body.vehiclePlate === 'string') updates.vehiclePlate = cleanString(body.vehiclePlate, 40).toUpperCase();
      if (body.routes !== undefined) updates.routes = cleanRoutes(body.routes);
      if (body.taxiStands !== undefined) updates.taxiStands = cleanTaxiStands(body.taxiStands);
      if (typeof body.rating === 'number' && Number.isFinite(body.rating)) {
        updates.rating = Math.min(5, Math.max(1, body.rating));
      }
      if (typeof body.aiNotes === 'string') updates.aiNotes = cleanString(body.aiNotes, 500);
    }

    const updatedUser = await writeWithColumnFallback(
      userUpdatesToRow(updates),
      PROFILE_OPTIONAL_COLUMNS,
      (row) =>
        supabase
          .from('users')
          .update(row)
          .eq('id', user.id)
          .select()
          .single()
    );

    if (action === 'set_role' && user.clerk_id) {
      await updateClerkUserRole(user.clerk_id, updates.role);
    }

    await logAdminActivity({
      action: `user.${action}`,
      targetType: 'user',
      targetId: user.id,
      targetLabel: user.full_name,
      summary:
        action === 'suspend'
          ? `Suspended ${user.full_name}`
          : action === 'unsuspend'
            ? `Unsuspended ${user.full_name}`
            : action === 'set_availability'
              ? `${updates.isAvailable ? 'Enabled' : 'Disabled'} availability for ${user.full_name}`
              : action === 'mark_subscription_paid'
                ? `Marked subscription paid for ${user.full_name}`
                : action === 'mark_subscription_unpaid'
                  ? `Marked subscription unpaid for ${user.full_name}`
                  : action === 'set_role'
                    ? `Changed ${user.full_name} to ${updates.role}`
                    : `Updated ${user.full_name}`,
      metadata: updates,
    });

    return adminJson({ success: true, user: formatUser(updatedUser) });
  } catch (error) {
    console.error('Failed to update user:', error);
    return adminJson(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  try {
    const user = await getUser(id);

    if (!user) {
      return adminJson(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return adminJson(
        { success: false, message: 'Admin users cannot be deleted here' },
        { status: 403 }
      );
    }

    if (user.clerk_id) {
      await deleteClerkUserAccount(user.clerk_id);
    }

    const deleteResults = await Promise.all([
      supabase.from('users').delete().eq('id', user.id),
      supabase.from('verification_requests').delete().eq('driver_id', user.id),
      user.clerk_id
        ? supabase.from('verification_requests').delete().eq('clerk_id', user.clerk_id)
        : Promise.resolve({ error: null }),
      user.clerk_id
        ? supabase.from('bookings').delete().or(`rider_id.eq.${user.clerk_id},driver_id.eq.${user.clerk_id}`)
        : Promise.resolve({ error: null }),
    ]);

    const deleteError = deleteResults.find((result) => result.error)?.error;
    if (deleteError) throw deleteError;

    await logAdminActivity({
      action: 'user.delete',
      targetType: 'user',
      targetId: user.id,
      targetLabel: user.full_name,
      summary: `Deleted ${user.full_name}`,
      metadata: { role: user.role, email: user.email },
    });

    return adminJson({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return adminJson(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
