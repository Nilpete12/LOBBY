import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';
import { TAXI_STAND_NAMES } from '@/lib/taxiStands';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanTaxiStands(value) {
  if (!Array.isArray(value)) return [];

  const allowed = new Map(TAXI_STAND_NAMES.map((name) => [name.toLowerCase(), name]));
  return [...new Set(
    value
      .map((stand) => cleanString(stand, 80))
      .map((stand) => allowed.get(stand.toLowerCase()))
      .filter(Boolean)
  )];
}

function cleanTaxiStand(value) {
  const stand = cleanString(value, 80);
  if (!stand) return '';

  const allowed = new Map(TAXI_STAND_NAMES.map((name) => [name.toLowerCase(), name]));
  return allowed.get(stand.toLowerCase()) || '';
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { clerkId, vehicle, vehiclePlate, phone, routes, taxiStands, currentStand, isAvailable } = body;
    const cleanClerkId = cleanString(clerkId, 120);

    if (!userId || userId !== cleanClerkId) {
      return NextResponse.json({ success: false, message: 'Please sign in again before saving.' }, { status: 401 });
    }

    const updates = {};
    if (vehicle !== undefined) updates.vehicle = cleanString(vehicle, 120);
    if (vehiclePlate !== undefined) updates.vehicle_plate = cleanString(vehiclePlate, 40).toUpperCase();
    if (phone !== undefined) updates.phone = cleanString(phone, 40);
    if (routes !== undefined) {
      updates.routes = Array.isArray(routes) ? routes.map((route) => cleanString(route, 80)).filter(Boolean) : [];
    }
    if (taxiStands !== undefined) updates.taxi_stands = cleanTaxiStands(taxiStands);
    if (currentStand !== undefined) {
      updates.current_stand = cleanTaxiStand(currentStand) || null;
      updates.current_stand_updated_at = updates.current_stand ? new Date().toISOString() : null;
    }
    if (isAvailable !== undefined) updates.is_available = Boolean(isAvailable);

    // Update the row in Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('clerk_id', cleanClerkId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, driver: formatUser(data) });

  } catch (error) {
    console.error("Update failed:", error);
    const errorText = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
    let message = 'Update failed';
    if (errorText.includes('vehicle_plate') && errorText.includes('does not exist')) {
      message = 'Vehicle plate storage is not set up yet. Please run the vehicle_plate database migration.';
    } else if (errorText.includes('taxi_stands') && errorText.includes('does not exist')) {
      message = 'Taxi stand storage is not set up yet. Please run the taxi_stands database migration.';
    } else if ((errorText.includes('current_stand') || errorText.includes('current_stand_updated_at')) && errorText.includes('does not exist')) {
      message = 'Live stand check-in storage is not set up yet. Please run the current_stand database migration.';
    }

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
