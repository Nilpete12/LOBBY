import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();
    const { clerkId, vehicle, phone, routes, isAvailable } = body;

    // Update the row in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ 
        vehicle, 
        phone, 
        routes, 
        is_available: isAvailable 
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) throw error;

    // Format for frontend
    const formattedDriver = {
      ...data,
      isAvailable: data.is_available,
      isVerified: data.is_verified
    };

    return NextResponse.json({ success: true, driver: formattedDriver });
    
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}