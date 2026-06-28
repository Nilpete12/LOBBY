import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await connectDB();
    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error('Failed to load complaints:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load complaints' },
      { status: 500 }
    );
  }
}
