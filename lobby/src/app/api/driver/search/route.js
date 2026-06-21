import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb'; 
import User from '@/models/User'; // Make sure you move your models to src/models/

export async function GET(request) {
  try {
    // 1. You MUST explicitly connect to the DB in every route file
    await connectDB();

    // 2. How to get URL Queries in Next.js (Replacing req.query)
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    let query = { role: 'driver', isAvailable: true };

    if (destination) {
      query.routes = { $regex: destination, $options: 'i' }; 
    }

    // 3. Run your Mongoose query
    const drivers = await User.find(query).select('-password');

    // 4. How to send a response in Next.js (Replacing res.json)
    return NextResponse.json({ success: true, drivers });
    
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" }, 
      { status: 500 }
    );
  }
}