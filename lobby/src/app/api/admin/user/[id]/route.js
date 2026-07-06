import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/supabase';
import Booking from '@/models/Bookings';
import User from '@/models/User';
import VerificationRequest from '@/models/VerificationRequest';
import { logAdminActivity } from '@/lib/adminActivity';
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

function serializeUser(user) {
  return {
    ...user,
    accountStatus: user.accountStatus || 'active',
    suspensionReason: user.suspensionReason || '',
  };
}

export async function GET(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user id' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const [verificationRequests, bookings] = await Promise.all([
      VerificationRequest.find({
        $or: [{ driverId: user._id }, ...(user.clerkId ? [{ clerkId: user.clerkId }] : [])],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      user.clerkId
        ? Booking.find({
            $or: [{ riderId: user.clerkId }, { driverId: user.clerkId }],
          })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        : [],
    ]);

    return NextResponse.json({
      success: true,
      user: serializeUser(user),
      verificationRequests,
      bookings,
    });
  } catch (error) {
    console.error('Failed to load user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user id' },
      { status: 400 }
    );
  }

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
    await connectDB();
    const user = await User.findById(id);

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
      updates.suspendedAt = new Date();
      updates.suspensionReason = cleanString(body.reason, 500) || 'Suspended by admin';
    } else if (action === 'unsuspend') {
      updates.accountStatus = 'active';
      updates.suspendedAt = null;
      updates.suspensionReason = '';
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-password').lean();

    await logAdminActivity({
      action: `user.${action}`,
      targetType: 'user',
      targetId: id,
      targetLabel: user.fullName,
      summary:
        action === 'suspend'
          ? `Suspended ${user.fullName}`
          : action === 'unsuspend'
            ? `Unsuspended ${user.fullName}`
            : `Updated ${user.fullName}`,
      metadata: updates,
    });

    return NextResponse.json({ success: true, user: serializeUser(updatedUser) });
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid user id' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(id);

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

    const verificationCleanupQuery = [{ driverId: user._id }];
    if (user.clerkId) verificationCleanupQuery.push({ clerkId: user.clerkId });

    await Promise.all([
      User.deleteOne({ _id: id }),
      VerificationRequest.deleteMany({
        $or: verificationCleanupQuery,
      }),
    ]);

    await logAdminActivity({
      action: 'user.delete',
      targetType: 'user',
      targetId: id,
      targetLabel: user.fullName,
      summary: `Deleted ${user.fullName}`,
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
