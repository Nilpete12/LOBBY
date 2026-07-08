import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { formatActivityLog } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function countRows(table, apply = (query) => query) {
  try {
    const query = apply(supabaseAdmin.from(table).select('*', { count: 'exact', head: true }));
    const { count, error } = await query;
    if (error) {
      const err = new Error(`Failed to count ${table}: ${error.message}`);
      throw err;
    }
    return count || 0;
  } catch (error) {
    console.error(`[countRows] Error counting ${table}:`, error.message || error);
    throw error;
  }
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
    const { data, error } = await supabaseAdmin
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
  console.log('[Admin Stats] Request received');
  
  if (!(await isAdminAuthenticated())) {
    console.log('[Admin Stats] Authentication failed');
    return adminUnauthorized();
  }

  try {
    console.log('[Admin Stats] Starting stats aggregation');
    
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
      safeCountRows('users'),
      safeCountRows('users', (query) => query.eq('role', 'driver')),
      safeCountRows('users', (query) => query.eq('role', 'driver').eq('is_available', true)),
      safeCountRows('users', (query) => query.eq('role', 'driver').eq('is_verified', false)),
      safeCountRows('verification_requests', (query) => query.in('status', ['pending', 'Pending'])),
      countPendingDriverLicenses(),
      safeCountRows('complaints', (query) => query.neq('status', 'resolved')),
      safeCountRows('users', (query) => query.eq('account_status', 'suspended')),
      safeCountRows('users', (query) => query.eq('role', 'driver').eq('subscription_status', 'paid')),
      safeCountRows('complaints', (query) => query.eq('report_type', 'driver_report').neq('status', 'resolved')),
      safeCountRows('analytics', (query) => query.eq('event_type', 'call_click')),
      safeCountRows('analytics', (query) => query.eq('event_type', 'profile_view')),
      safeCountRows('analytics', (query) => query.eq('event_type', 'whatsapp_click')),
      (async () => {
        try {
          const result = await supabaseAdmin.from('bookings').select('status,destination');
          return result;
        } catch (err) {
          console.error('[Admin Stats] Error fetching bookings:', err);
          return { data: [], error: err };
        }
      })(),
      (async () => {
        try {
          const result = await supabaseAdmin.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(5);
          return result;
        } catch (err) {
          console.error('[Admin Stats] Error fetching activity logs:', err);
          return { data: [], error: err };
        }
      })(),
    ]);

    console.log('[Admin Stats] Counters aggregated successfully:', { totalUsers, totalDrivers, activeDrivers });

    if (bookingsResult?.error) console.warn('[Admin Stats] Bookings error:', bookingsResult.error);
    if (recentActivityResult?.error) console.warn('[Admin Stats] Activity logs error:', recentActivityResult.error);

    const bookings = bookingsResult?.data || [];
    const recentActivity = recentActivityResult?.data || [];

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
        recentActivity: recentActivity.map(formatActivityLog),
      },
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');
    console.log('[Admin Stats] Response sent successfully');
    return response;
  } catch (error) {
    console.error('[Admin Stats] Error:', error?.message || error, error?.stack);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch admin stats',
        ...(isDev && { error: error?.message || String(error) })
      }, 
      { status: 500 }
    );
  }
}
