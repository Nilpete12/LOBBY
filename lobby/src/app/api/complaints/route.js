import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPlatformSettings } from '@/lib/platformSettings';
import { rateLimit } from '@/lib/rateLimit';

const ALLOWED_ROLES = new Set(['rider', 'driver', 'guest']);
const ALLOWED_REPORT_TYPES = new Set(['general', 'driver_report']);

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
    const { userId } = await auth();
    const name = cleanString(body.name, 160);
    const email = cleanString(body.email, 254);
    const topic = cleanString(body.topic || body.subject, 160);
    const message = cleanString(body.message, 5000);
    const role = ALLOWED_ROLES.has(body.role) ? body.role : 'guest';
    const reportType = ALLOWED_REPORT_TYPES.has(body.reportType) ? body.reportType : 'general';
    const driverId = cleanString(body.driverId, 120);
    const driverName = cleanString(body.driverName, 160);

    if (!name || !topic || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, topic, and message are required' },
        { status: 400 }
      );
    }

    const settings = await getPlatformSettings();
    if (settings.maintenanceMode || !settings.supportOpen) {
      return NextResponse.json(
        { success: false, message: 'Support messages are temporarily closed' },
        { status: 503 }
      );
    }

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        user_id: cleanString(body.userId, 160) || userId || null,
        name,
        email,
        role,
        subject: topic,
        topic,
        message,
        status: 'pending',
        report_type: reportType,
        driver_id: driverId || null,
        driver_name: driverName,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error('Support Submission Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit support ticket' }, { status: 500 });
  }
}
