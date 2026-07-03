import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { rateLimit } from '@/lib/rateLimit';

const ALLOWED_ROLES = new Set(['rider', 'driver', 'guest']);

function cleanString(value, maxLength = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'complaints',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (limited) return limited;

  try {
    const body = await request.json();
    const name = cleanString(body.name, 160);
    const email = cleanString(body.email, 254);
    const topic = cleanString(body.topic, 160);
    const message = cleanString(body.message, 5000);
    const role = ALLOWED_ROLES.has(body.role) ? body.role : 'guest';

    if (!name || !topic || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, topic, and message are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const complaint = await Complaint.create({
      userId: cleanString(body.userId, 160) || undefined,
      name,
      email,
      role,
      topic,
      message,
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error('Failed to create complaint:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}
