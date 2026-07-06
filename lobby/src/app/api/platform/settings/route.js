import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// Import only the function that exists
import { getPlatformSettings } from '@/lib/platformSettings';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  // If you are using this for riders/drivers, remove the admin check
  // If this is strictly for admin, keep the check below:
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const settings = await getPlatformSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const body = await req.json();
    const { baseFare, perKmRate, serviceFeePercentage } = body;

    // Delete and Re-insert
    await supabase.from('platform_settings').delete().neq('base_fare', -999); 
    
    const { data, error } = await supabase
      .from('platform_settings')
      .insert([{ 
        base_fare: baseFare, 
        per_km_rate: perKmRate, 
        service_fee_percentage: serviceFeePercentage 
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      settings: {
        baseFare: data.base_fare,
        perKmRate: data.per_km_rate,
        serviceFeePercentage: data.service_fee_percentage,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}