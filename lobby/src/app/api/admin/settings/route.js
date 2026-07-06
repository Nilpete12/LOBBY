import { NextResponse } from 'next/server';
import {
  getPlatformSettings,
  serializePlatformSettings,
  updatePlatformSettings,
} from '@/lib/platformSettings';
import { logAdminActivity } from '@/lib/adminActivity';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const settings = await getPlatformSettings();
    return NextResponse.json({ success: true, settings: serializePlatformSettings(settings) });
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load settings' },
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

  const updates = {};
  for (const key of ['maintenanceMode', 'registrationOpen', 'bookingOpen', 'supportOpen']) {
    if (typeof body[key] === 'boolean') updates[key] = body[key];
  }

  if (typeof body.notice === 'string') updates.notice = cleanString(body.notice, 300);

  try {
    const settings = await updatePlatformSettings(updates);

    await logAdminActivity({
      action: 'settings.update',
      targetType: 'platform',
      targetId: 'global',
      targetLabel: 'Platform settings',
      summary: 'Updated platform settings',
      metadata: updates,
    });

    return NextResponse.json({ success: true, settings: serializePlatformSettings(settings) });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
