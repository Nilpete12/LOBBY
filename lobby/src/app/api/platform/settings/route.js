import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getPlatformSettings, serializePlatformSettings } from '@/lib/platformSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await getPlatformSettings();
    const response = NextResponse.json({ success: true, settings: serializePlatformSettings(settings) });
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
      },
    });
    response.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return response;
  }
}
