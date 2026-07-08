import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { clerkId, vehicle, vehiclePlate, phone, routes, isAvailable } = body;
    const cleanClerkId = cleanString(clerkId, 120);

    if (!userId || userId !== cleanClerkId) {
      return NextResponse.json({ success: false, message: 'Please sign in again before saving.' }, { status: 401 });
    }

    // Update the row in Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        vehicle: cleanString(vehicle, 120),
        vehicle_plate: cleanString(vehiclePlate, 40).toUpperCase(),
        phone: cleanString(phone, 40),
        routes: Array.isArray(routes) ? routes.map((route) => cleanString(route, 80)).filter(Boolean) : [],
        is_available: isAvailable
      })
      .eq('clerk_id', cleanClerkId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, driver: formatUser(data) });

  } catch (error) {
    console.error("Update failed:", error);
    const errorText = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
    const message = errorText.includes('vehicle_plate') && errorText.includes('does not exist')
      ? 'Vehicle plate storage is not set up yet. Please run the vehicle_plate database migration.'
      : 'Update failed';

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
