import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatActivityLog } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function countRows(table, apply = (query) => query) {
  const query = apply(supabase.from(table).select('*', { count: 'exact', head: true }));
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function safeCountRows(table, apply = (query) => query) {
  try {
    return await countRows(table, apply);
  } catch (error) {
    console.error(`Failed to count ${table}:`, error);
    return 0;
  }
}

async function countPendingDriverLicenses() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('verification_status')
      .eq('role', 'driver')
      .eq('is_verified', false)
      .not('license_url', 'is', null);

    if (error) throw error;

    return (data || []).filter((driver) => {
      const status = String(driver.verification_status || 'pending').toLowerCase();
      return !['approved', 'rejected'].includes(status);
    }).length;
  } catch (error) {
    console.error('Failed to count pending driver licenses:', error);
    return 0;
  }
}

function countByKey(rows = [], key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topDestinations(rows = []) {
  const counts = countByKey(rows, 'destination');
  return Object.entries(counts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const [
      totalUsers,
      totalDrivers,
      activeDrivers,
      pendingDrivers,
      pendingVerificationRequestRows,
      pendingDriverLicenseRows,
      pendingComplaints,
      suspendedUsers,
      paidSubscriptions,
      activeDriverReports,
      totalCalls,
      totalProfileViews,
      totalWhatsAppClicks,
      bookingsResult,
      recentActivityResult,
    ] = await Promise.all([
      countRows('users'),
      countRows('users', (query) => query.eq('role', 'driver')),
      countRows('users', (query) => query.eq('role', 'driver').eq('is_available', true)),
      countRows('users', (query) => query.eq('role', 'driver').eq('is_verified', false)),
      safeCountRows('verification_requests', (query) => query.in('status', ['pending', 'Pending'])),
      countPendingDriverLicenses(),
      countRows('complaints', (query) => query.neq('status', 'resolved')),
      countRows('users', (query) => query.eq('account_status', 'suspended')),
      countRows('users', (query) => query.eq('role', 'driver').eq('subscription_status', 'paid')),
      countRows('complaints', (query) => query.eq('report_type', 'driver_report').neq('status', 'resolved')),
      countRows('analytics', (query) => query.eq('event_type', 'call_click')),
      countRows('analytics', (query) => query.eq('event_type', 'profile_view')),
      countRows('analytics', (query) => query.eq('event_type', 'whatsapp_click')),
      supabase.from('bookings').select('status,destination'),
      supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    if (bookingsResult.error) throw bookingsResult.error;
    if (recentActivityResult.error) throw recentActivityResult.error;

    const bookings = bookingsResult.data || [];

    const response = NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalRiders: Math.max(0, totalUsers - totalDrivers),
        totalDrivers,
        activeDrivers,
        pendingDrivers,
        pendingVerificationRequests: Math.max(pendingVerificationRequestRows, pendingDriverLicenseRows),
        pendingComplaints,
        suspendedUsers,
        paidSubscriptions,
        activeDriverReports,
        totalCalls,
        totalProfileViews,
        totalWhatsAppClicks,
        totalBookings: bookings.length,
        activeRides: bookings.filter((booking) => booking.status === 'accepted').length,
        bookingStatus: countByKey(bookings, 'status'),
        topDestinations: topDestinations(bookings),
        recentActivity: (recentActivityResult.data || []).map(formatActivityLog),
      },
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
