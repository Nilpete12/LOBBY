import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

const ALLOWED_STATUSES = new Set(['pending', 'in_review', 'waiting_for_user', 'resolved']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function PUT(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!supabase.auth.user() || !id) {
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

    await logAdminActivity({
      action: 'complaint.resolve',
      targetType: 'complaint',
      targetId: id,
      targetLabel: complaint.topic,
      summary: `Resolved support ticket from ${complaint.name}`,
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Failed to resolve complaint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resolve complaint' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid complaint id' },
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

  const nextStatus = cleanString(body.status, 40);
  const note = cleanString(body.note, 500);

  if (!ALLOWED_STATUSES.has(nextStatus)) {
    return NextResponse.json(
      { success: false, message: 'Invalid complaint status' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const update = { $set: { status: nextStatus } };
    if (note) {
      update.$push = { internalNotes: { note, createdAt: new Date() } };
    }

    const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true }).lean();

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    await logAdminActivity({
      action: 'complaint.update',
      targetType: 'complaint',
      targetId: id,
      targetLabel: complaint.topic,
      summary: `Updated support ticket to ${nextStatus}`,
      metadata: { note },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Failed to update complaint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}
