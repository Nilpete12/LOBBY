import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';

const SEARCH_DRIVER_COLUMNS = [
  'id',
  'clerk_id',
  'full_name',
  'role',
  'phone',
  'vehicle',
  'vehicle_type',
  'routes',
  'is_available',
  'is_verified',
  'account_status',
  'profile_pic',
  'image_url',
  'car_pic',
  'vehicle_plate',
  'taxi_stands',
  'current_stand',
  'current_stand_updated_at',
  'rating',
  'created_at',
  'updated_at',
].join(',');

function isMissingColumnError(error = {}) {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return (
    (text.includes('column') && text.includes('does not exist')) ||
    (text.includes('could not find') && text.includes('schema cache'))
  );
}

function publicDriver(driver = {}) {
  const formatted = formatUser(driver);

  return {
    _id: formatted._id,
    id: formatted.id,
    clerkId: formatted.clerkId,
    fullName: formatted.fullName,
    role: formatted.role,
    phone: formatted.phone || '',
    vehicle: formatted.vehicle || '',
    vehicleType: formatted.vehicleType,
    routes: Array.isArray(formatted.routes) ? formatted.routes : [],
    rating: formatted.rating || 5,
    profilePic: formatted.profilePic,
    carPic: formatted.carPic,
    vehiclePlate: formatted.vehiclePlate,
    taxiStands: formatted.taxiStands,
    currentStand: formatted.currentStand,
    currentStandUpdatedAt: formatted.currentStandUpdatedAt,
    isAvailable: formatted.isAvailable,
    isVerified: formatted.isVerified,
    accountStatus: formatted.accountStatus,
    createdAt: formatted.createdAt,
    updatedAt: formatted.updatedAt,
  };
}

function availableDriversQuery(columns) {
  return supabase
    .from('users')
    .select(columns)
    .eq('role', 'driver')
    .eq('is_available', true)
    .eq('is_verified', true)
    .or('account_status.is.null,account_status.neq.suspended');
}

async function loadAvailableDrivers() {
  const result = await availableDriversQuery(SEARCH_DRIVER_COLUMNS);

  if (!result.error || !isMissingColumnError(result.error)) return result;

  console.warn('Driver search fell back to select(*) because a public search column is missing.');
  return availableDriversQuery('*');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('destination')?.toLowerCase();
    const taxiStand = searchParams.get('stand')?.trim().toLowerCase();

    // Fetch all available drivers
    let { data: drivers, error } = await loadAvailableDrivers();

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
        const currentStand = String(driver.current_stand || '').toLowerCase();

        return currentStand === taxiStand ||
          stands.some((stand) => String(stand).toLowerCase() === taxiStand) ||
          routes.some((route) => String(route).toLowerCase().includes(taxiStand));
      });

      drivers = drivers.sort((a, b) => {
        const aLiveMatch = String(a.current_stand || '').toLowerCase() === taxiStand;
        const bLiveMatch = String(b.current_stand || '').toLowerCase() === taxiStand;
        return Number(bLiveMatch) - Number(aLiveMatch);
      });
    }

    const response = NextResponse.json({
      success: true,
      drivers: (drivers || []).map(publicDriver),
    });

    response.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=45');
    return response;

  } catch (error) {
    console.error("Driver Search Error:", error);
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}
