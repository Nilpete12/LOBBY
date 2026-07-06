import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
       return NextResponse.json({
        success: true,
        settings: { baseFare: 50, perKmRate: 20, serviceFeePercentage: 5 }
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        baseFare: data.base_fare,
        perKmRate: data.per_km_rate,
        serviceFeePercentage: data.service_fee_percentage,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const body = await req.json();
    const { baseFare, perKmRate, serviceFeePercentage } = body;

    // Delete existing settings and insert new ones
    await supabase.from('platform_settings').delete().neq('base_fare', -1); 
    
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