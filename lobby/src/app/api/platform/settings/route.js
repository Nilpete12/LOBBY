import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getPlatformSettings, serializePlatformSettings } from '@/lib/platformSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await getPlatformSettings();
    return NextResponse.json({ success: true, settings: serializePlatformSettings(settings) });
  } catch (error) {
    console.error('Failed to load platform settings:', error);
    return NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: false,
        registrationOpen: true,
        bookingOpen: true,
        supportOpen: true,
        notice: '',
      },
    });
  }
}
