import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch pending requests from Supabase
    const { data: requests, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case database columns to the camelCase frontend expectations
    const formattedRequests = requests.map(req => ({
      id: req.id, // Supabase standard ID
      clerkId: req.clerk_id,
      driverName: req.driver_name,
      email: req.email,
      phone: req.phone,
      vehicle: req.vehicle,
      licenseUrl: req.license_url,
      status: req.status,
      createdAt: req.created_at,
      reviewNotes: req.review_notes
    }));

    return NextResponse.json({ success: true, requests: formattedRequests });

  } catch (error) {
    console.error("Verification fetch error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}