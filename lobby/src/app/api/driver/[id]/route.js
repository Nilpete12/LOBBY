import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { formatDriverNotification, formatUser } from '@/lib/supabaseFormat';

function isMissingNotificationTable(error = {}) {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return text.includes('driver_notifications') && (text.includes('does not exist') || text.includes('schema cache'));
}

async function loadDriverNotifications(clerkId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('driver_notifications')
      .select('*')
      .eq('clerk_id', clerkId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      if (isMissingNotificationTable(error)) return [];
      throw error;
    }

    return (data || []).map(formatDriverNotification);
  } catch (error) {
    console.error('Driver notification lookup failed:', error);
    return [];
  }
}

export async function GET(request, context) {
  try {
    const params = await context.params;

    // Search Supabase using the clerk_id
    const { data: driver, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', params.id)
      .single();

    if (error || !driver) {
      return NextResponse.json({ success: false, message: "Driver not found." }, { status: 404 });
    }

    const notifications = await loadDriverNotifications(driver.clerk_id);
    const formattedDriver = { ...formatUser(driver), notifications };

    return NextResponse.json({ success: true, driver: formattedDriver, notifications }, { status: 200 });
  } catch (error) {
    console.error("Driver lookup failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load profile" }, { status: 500 });
  }
}
