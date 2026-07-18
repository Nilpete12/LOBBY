import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { formatActivityLog } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { getDriverReadiness } from '@/lib/driverReadiness';

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

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasDriverStand(driver = {}) {
  const taxiStands = Array.isArray(driver.taxi_stands) ? driver.taxi_stands : [];
  return hasText(driver.current_stand) || taxiStands.some(hasText);
}

function buildPilotReadiness(users = [], openComplaints = 0, pendingVerificationRequests = 0) {
  const drivers = users.filter((user) => user.role === 'driver');
  const riders = users.filter((user) => user.role === 'rider');
  const driverReadiness = drivers.map((driver) => ({
    driver,
    readiness: getDriverReadiness(driver),
  }));
  const brokenDrivers = driverReadiness.filter((item) => !item.readiness.ready);
  const driversReady = driverReadiness.filter((item) => item.readiness.ready).length;
  const withoutPhone = drivers.filter((driver) => !hasText(driver.phone)).length;
  const withoutPlate = drivers.filter((driver) => !hasText(driver.vehicle_plate)).length;
  const withoutStand = drivers.filter((driver) => !hasDriverStand(driver)).length;
  const withoutVehicleType = drivers.filter((driver) => !hasText(driver.vehicle_type)).length;
  const withoutVehiclePhoto = drivers.filter((driver) => !hasText(driver.car_pic)).length;
  const withoutLicense = drivers.filter((driver) => !hasText(driver.license_url)).length;
  const unverifiedDrivers = drivers.filter((driver) => driver.is_verified !== true).length;
  const onlineButBlocked = driverReadiness.filter((item) => item.driver.is_available === true && !item.readiness.ready).length;
  const readinessPercent = drivers.length ? Math.round((driversReady / drivers.length) * 100) : 0;

  return {
    driversReady,
    verifiedDrivers: drivers.length - unverifiedDrivers,
    pendingDocuments: pendingVerificationRequests,
    ridersRegistered: riders.length,
    openComplaints,
    brokenProfiles: brokenDrivers.length,
    withoutPhone,
    withoutPlate,
    withoutStand,
    withoutVehicleType,
    withoutVehiclePhoto,
    withoutLicense,
    unverifiedDrivers,
    onlineButBlocked,
    readinessPercent,
    blockers: [
      { key: 'pendingDocuments', label: 'Pending documents', count: pendingVerificationRequests, tab: 'verifications' },
      { key: 'openComplaints', label: 'Open complaints', count: openComplaints, tab: 'complaints' },
      { key: 'withoutPhone', label: 'Drivers without phone', count: withoutPhone, tab: 'drivers' },
      { key: 'withoutPlate', label: 'Drivers without plate', count: withoutPlate, tab: 'drivers' },
      { key: 'withoutStand', label: 'Drivers without stand', count: withoutStand, tab: 'drivers' },
      { key: 'withoutVehicleType', label: 'Drivers without vehicle type', count: withoutVehicleType, tab: 'drivers' },
      { key: 'withoutVehiclePhoto', label: 'Drivers without vehicle photo', count: withoutVehiclePhoto, tab: 'drivers' },
      { key: 'withoutLicense', label: 'Drivers without license', count: withoutLicense, tab: 'verifications' },
      { key: 'unverifiedDrivers', label: 'Unverified drivers', count: unverifiedDrivers, tab: 'verifications' },
      { key: 'onlineButBlocked', label: 'Online but hidden by readiness lock', count: onlineButBlocked, tab: 'drivers' },
    ].filter((blocker) => blocker.count > 0),
    driverIssues: brokenDrivers.slice(0, 12).map(({ driver, readiness }) => ({
      id: driver.id,
      clerkId: driver.clerk_id,
      fullName: driver.full_name || 'Unnamed driver',
      phone: driver.phone || '',
      isAvailable: Boolean(driver.is_available),
      isVerified: Boolean(driver.is_verified),
      missing: readiness.missing,
    })),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return adminUnauthorized();
  }

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
      totalSearches,
      reportedCompletedRides,
      riderConfirmedRides,
      usersForReadinessResult,
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
      safeCountRows('analytics', (query) => query.eq('event_type', 'search')),
      safeCountRows('analytics', (query) => query.in('lead_status', ['driver_reported_completed', 'confirmed_completed'])),
      safeCountRows('analytics', (query) => query.in('lead_status', ['rider_confirmed_completed', 'confirmed_completed'])),
      (async () => {
        try {
          return await supabaseAdmin.from('users').select('*').limit(1000);
        } catch (err) {
          console.error('[Admin Stats] Error fetching users for pilot readiness:', err);
          return { data: [], error: err };
        }
      })(),
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

    if (bookingsResult?.error) console.warn('[Admin Stats] Bookings error:', bookingsResult.error);
    if (usersForReadinessResult?.error) console.warn('[Admin Stats] Pilot readiness users error:', usersForReadinessResult.error);
    if (recentActivityResult?.error) console.warn('[Admin Stats] Activity logs error:', recentActivityResult.error);

    const bookings = bookingsResult?.data || [];
    const usersForReadiness = usersForReadinessResult?.data || [];
    const recentActivity = recentActivityResult?.data || [];
    const pendingVerificationRequests = Math.max(pendingVerificationRequestRows, pendingDriverLicenseRows);
    const pilotReadiness = buildPilotReadiness(usersForReadiness, pendingComplaints, pendingVerificationRequests);

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
        totalSearches,
        reportedCompletedRides,
        riderConfirmedRides,
        totalBookings: bookings.length,
        activeRides: bookings.filter((booking) => booking.status === 'accepted').length,
        bookingStatus: countByKey(bookings, 'status'),
        topDestinations: topDestinations(bookings),
        recentActivity: recentActivity.map(formatActivityLog),
        pilotReadiness,
      },
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');
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
