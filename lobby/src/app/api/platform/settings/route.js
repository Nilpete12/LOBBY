import { NextResponse } from 'next/server';
import { getPlatformSettings, serializePlatformSettings } from '@/lib/platformSettings';

export async function GET() {
  try {
    const settings = await getPlatformSettings();
    const response = NextResponse.json({
      success: true,
      settings: serializePlatformSettings(settings),
    });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Failed to load platform settings:', error);
    const response = NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: false,
        registrationOpen: true,
        bookingOpen: true,
        supportOpen: true,
        notice: '',
        baseFare: 50,
        perKmRate: 20,
        serviceFeePercentage: 5,
      },
    });
    response.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return response;
  }
}
