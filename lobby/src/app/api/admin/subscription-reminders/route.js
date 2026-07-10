import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { logAdminActivity } from '@/lib/adminActivity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function adminJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function normalizeWhatsappPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function buildReminderMessage(driver, message) {
  const name = driver.full_name || 'Driver';
  return `Hi ${name}, ${message}`;
}

function buildWhatsappLink(driver, message) {
  const phone = normalizeWhatsappPhone(driver.phone);
  if (!phone) return null;

  return {
    driverId: driver.id,
    clerkId: driver.clerk_id,
    driverName: driver.full_name || 'Driver',
    phone: driver.phone || '',
    href: `https://wa.me/${phone}?text=${encodeURIComponent(buildReminderMessage(driver, message))}`,
  };
}

function missingReminderTable(error = {}) {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return text.includes('driver_notifications') && (text.includes('does not exist') || text.includes('schema cache'));
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const title = cleanString(body.title, 160) || 'Subscription fee reminder';
  const message = cleanString(
    body.message,
    500
  ) || 'this is THE LOBBY. Your driver subscription fee is pending. Please pay it to keep your profile active and visible to riders. Thank you.';

  try {
    const { data: drivers = [], error: driversError } = await supabaseAdmin
      .from('users')
      .select('id,clerk_id,full_name,phone,role,account_status,subscription_status')
      .eq('role', 'driver')
      .limit(500);

    if (driversError) throw driversError;

    const targetDrivers = drivers.filter((driver) => {
      const isSuspended = driver.account_status === 'suspended';
      const subscriptionStatus = String(driver.subscription_status || 'unpaid').toLowerCase();
      return driver.clerk_id && !isSuspended && subscriptionStatus !== 'paid';
    });

    if (!targetDrivers.length) {
      return adminJson({
        success: true,
        targetedCount: 0,
        whatsAppLinks: [],
        skippedWhatsappCount: 0,
        message: 'No unpaid active drivers found.',
      });
    }

    const notificationRows = targetDrivers.map((driver) => ({
      driver_id: driver.id,
      clerk_id: driver.clerk_id,
      type: 'subscription_reminder',
      title,
      message,
      status: 'unread',
      channel: 'dashboard_whatsapp',
      metadata: {
        sent_by: process.env.ADMIN_EMAIL || 'admin',
        subscription_status: driver.subscription_status || 'unpaid',
      },
    }));

    const { error: notificationError } = await supabaseAdmin
      .from('driver_notifications')
      .insert(notificationRows);

    if (notificationError) {
      if (missingReminderTable(notificationError)) {
        return adminJson(
          {
            success: false,
            message: 'Driver notification storage is not set up yet. Please run the driver_notifications migration.',
          },
          { status: 500 }
        );
      }

      throw notificationError;
    }

    const whatsAppLinks = targetDrivers
      .map((driver) => buildWhatsappLink(driver, message))
      .filter(Boolean);

    const skippedWhatsappCount = targetDrivers.length - whatsAppLinks.length;

    await logAdminActivity({
      action: 'subscription.reminder_sent',
      targetType: 'driver',
      targetId: 'bulk',
      targetLabel: `${targetDrivers.length} unpaid drivers`,
      summary: `Sent subscription reminders to ${targetDrivers.length} unpaid drivers`,
      metadata: {
        targetedCount: targetDrivers.length,
        whatsAppReadyCount: whatsAppLinks.length,
        skippedWhatsappCount,
      },
    });

    return adminJson({
      success: true,
      targetedCount: targetDrivers.length,
      whatsAppLinks,
      skippedWhatsappCount,
      message: `Dashboard reminders created for ${targetDrivers.length} driver${targetDrivers.length === 1 ? '' : 's'}.`,
    });
  } catch (error) {
    console.error('Failed to send subscription reminders:', error);
    return adminJson(
      { success: false, message: 'Failed to send subscription reminders' },
      { status: 500 }
    );
  }
}
