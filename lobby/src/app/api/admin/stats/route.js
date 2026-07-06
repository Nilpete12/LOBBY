import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    // 1. Get Total Riders (head: true means don't download row data, just give the exact count!)
    const { count: totalRiders } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'rider');

    // 2. Get Total Drivers
    const { count: totalDrivers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver');

    // 3. Get Pending Driver Verifications
    const { count: pendingDrivers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver')
      .eq('verification_status', 'Pending');

    // 4. Get Total Bookings & Active Rides
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    const { count: activeRides } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted');

    return NextResponse.json({
      success: true,
      stats: {
        totalRiders: totalRiders || 0,
        totalDrivers: totalDrivers || 0,
        pendingDrivers: pendingDrivers || 0,
        totalBookings: totalBookings || 0,
        activeRides: activeRides || 0
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch admin stats' }, { status: 500 });
  }
}