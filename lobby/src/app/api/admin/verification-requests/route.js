import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationRequest from '@/models/VerificationRequest';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'superseded']);
const ALLOWED_ACTIONS = new Set(['approve', 'reject']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function serializeRequest(request) {
  return {
    _id: request._id,
    driverId: request.driverId,
    clerkId: request.clerkId,
    driverName: request.driverName,
    email: request.email || '',
    phone: request.phone || '',
    vehicle: request.vehicle || '',
    licenseUrl: request.licenseUrl,
    status: request.status,
    notes: request.notes || '',
    reviewNotes: request.reviewNotes || '',
    reviewedAt: request.reviewedAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const query = ALLOWED_STATUSES.has(status) ? { status } : {};

  try {
    await connectDB();
    const requests = await VerificationRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      requests: requests.map(serializeRequest),
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

  const id = cleanString(body.id, 80);
  const action = cleanString(body.action, 20);
  const reviewNotes = cleanString(body.notes, 500);

  if (!mongoose.Types.ObjectId.isValid(id) || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { success: false, message: 'Invalid verification action' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const verificationRequest = await VerificationRequest.findById(id);
    if (!verificationRequest) {
      return NextResponse.json(
        { success: false, message: 'Verification request not found' },
        { status: 404 }
      );
    }

    const approved = action === 'approve';
    const nextStatus = approved ? 'approved' : 'rejected';
    const nextNote = reviewNotes || (approved ? 'Approved by admin' : 'Rejected by admin');
    const driverUpdates = {
      isVerified: approved,
      verificationStatus: approved ? 'Approved' : 'Rejected',
      aiNotes: nextNote,
      licenseUrl: verificationRequest.licenseUrl,
    };

    if (!approved) {
      driverUpdates.isAvailable = false;
    }

    const driver = await User.findOneAndUpdate(
      { _id: verificationRequest.driverId, role: 'driver' },
      { $set: driverUpdates },
      { new: true }
    ).select('-password');

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    verificationRequest.status = nextStatus;
    verificationRequest.reviewNotes = nextNote;
    verificationRequest.reviewedAt = new Date();
    await verificationRequest.save();

    return NextResponse.json({
      success: true,
      request: serializeRequest(verificationRequest.toObject()),
      driver,
    });
  } catch (error) {
    console.error('Failed to update verification request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update verification request' },
      { status: 500 }
    );
  }
}
