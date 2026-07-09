import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('destination')?.toLowerCase();
    const taxiStand = searchParams.get('stand')?.trim().toLowerCase();

    // Fetch all available drivers
    let { data: drivers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver')
      .eq('is_available', true)
      .eq('is_verified', true)
      .or('account_status.is.null,account_status.neq.suspended');

    if (error) throw error;

    // Optional: Filter by route if the rider typed a destination
    if (query && drivers) {
      drivers = drivers.filter(driver =>
        driver.routes && driver.routes.some(route => String(route).toLowerCase().includes(query))
      );
    }

    if (taxiStand && drivers) {
      drivers = drivers.filter((driver) => {
        const stands = Array.isArray(driver.taxi_stands) ? driver.taxi_stands : [];
        const routes = Array.isArray(driver.routes) ? driver.routes : [];

        return stands.some((stand) => String(stand).toLowerCase() === taxiStand) ||
          routes.some((route) => String(route).toLowerCase().includes(taxiStand));
      });
    }

    return NextResponse.json({ success: true, drivers: (drivers || []).map(formatUser) });

  } catch (error) {
    console.error("Driver Search Error:", error);
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}
