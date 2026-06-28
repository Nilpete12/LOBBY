import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function PUT(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid complaint id' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: { status: 'resolved' } },
      { new: true }
    );

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Failed to resolve complaint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resolve complaint' },
      { status: 500 }
    );
  }
}
