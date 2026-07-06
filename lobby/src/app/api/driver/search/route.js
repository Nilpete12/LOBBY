import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('destination')?.toLowerCase();

    // Fetch all available drivers
    let { data: drivers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver')
      .eq('is_available', true);

    if (error) throw error;

    // Optional: Filter by route if the rider typed a destination
    if (query && drivers) {
      drivers = drivers.filter(driver => 
        driver.routes && driver.routes.some(route => route.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, drivers });

  } catch (error) {
    console.error("Driver Search Error:", error);
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}