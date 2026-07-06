import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Convert snake_case from DB back to camelCase for your React frontend
    const formattedDriver = {
      ...driver,
      clerkId: driver.clerk_id,
      fullName: driver.full_name,
      isAvailable: driver.is_available,
      isVerified: driver.is_verified,
      carPic: driver.car_pic
    };

    return NextResponse.json({ success: true, driver: formattedDriver }, { status: 200 });
  } catch (error) {
    console.error("Driver lookup failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load profile" }, { status: 500 });
  }
}