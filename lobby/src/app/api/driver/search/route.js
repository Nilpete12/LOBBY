import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb'; 
import User from '@/models/User'; // Make sure you move your models to src/models/

const PUBLIC_DRIVER_FIELDS = 'fullName phone vehicle routes rating profilePic carPic';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination')?.trim().slice(0, 80);

    let query = {
      role: 'driver',
      isAvailable: true,
      isVerified: true,
      accountStatus: { $ne: 'suspended' },
    };

    if (destination) {
      query.routes = { $regex: escapeRegex(destination), $options: 'i' };
    }

    const drivers = await User.find(query)
      .select(PUBLIC_DRIVER_FIELDS)
      .limit(50)
      .lean();

    const response = NextResponse.json({ success: true, drivers });
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    return response;
    
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" }, 
      { status: 500 }
    );
  }
}
