import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import {
  formatBooking,
  formatUser,
  formatVerificationRequest,
  userUpdatesToRow,
} from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
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
      return NextResponse.json(
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

    return NextResponse.json({
      success: true,
      user: formatUser(user),
      verificationRequests: (verificationResult.data || []).map(formatVerificationRequest),
      bookings: (bookingsResult.data || []).map((booking) => formatBooking(booking)),
    });
  } catch (error) {
    console.error('Failed to load user:', error);
    return NextResponse.json(
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
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const action = cleanString(body.action, 40) || 'update';

  try {
    const user = await getUser(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
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
        return NextResponse.json(
          { success: false, message: 'Only driver availability can be changed' },
          { status: 400 }
        );
      }

      if (user.account_status === 'suspended') {
        return NextResponse.json(
          { success: false, message: 'Suspended drivers cannot be made available' },
          { status: 400 }
        );
      }

      updates.isAvailable = Boolean(body.isAvailable);
    } else if (action === 'mark_subscription_paid') {
      if (user.role !== 'driver') {
        return NextResponse.json(
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
        return NextResponse.json(
          { success: false, message: 'Only driver subscriptions can be changed' },
          { status: 400 }
        );
      }

      updates.subscriptionStatus = 'unpaid';
      updates.subscriptionPaidAt = null;
      updates.subscriptionPaidUntil = null;
    } else {
      if (typeof body.fullName === 'string') updates.fullName = cleanString(body.fullName, 160);
      if (typeof body.phone === 'string') updates.phone = cleanString(body.phone, 40);
      if (typeof body.vehicle === 'string') updates.vehicle = cleanString(body.vehicle, 120);
      if (body.routes !== undefined) updates.routes = cleanRoutes(body.routes);
      if (typeof body.rating === 'number' && Number.isFinite(body.rating)) {
        updates.rating = Math.min(5, Math.max(1, body.rating));
      }
      if (typeof body.aiNotes === 'string') updates.aiNotes = cleanString(body.aiNotes, 500);
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(userUpdatesToRow(updates))
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

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
                  : `Updated ${user.full_name}`,
      metadata: updates,
    });

    return NextResponse.json({ success: true, user: formatUser(updatedUser) });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
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
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin users cannot be deleted here' },
        { status: 403 }
      );
    }

    await Promise.all([
      supabase.from('users').delete().eq('id', user.id),
      supabase.from('verification_requests').delete().eq('driver_id', user.id),
      user.clerk_id
        ? supabase.from('verification_requests').delete().eq('clerk_id', user.clerk_id)
        : Promise.resolve({ error: null }),
    ]);

    await logAdminActivity({
      action: 'user.delete',
      targetType: 'user',
      targetId: user.id,
      targetLabel: user.full_name,
      summary: `Deleted ${user.full_name}`,
      metadata: { role: user.role, email: user.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
