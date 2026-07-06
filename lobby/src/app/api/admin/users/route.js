import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';

export async function GET(req) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role'); // optional: 'rider' or 'driver'

    let query = supabase
      .from('users')
      .select('*')
      .order('id', { ascending: false });

    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    // Map DB snake_case back to camelCase for the frontend UserTable
    const formattedUsers = users.map(u => ({
      ...u,
      _id: u.id,
      clerkId: u.clerk_id,
      fullName: u.full_name,
      isVerified: u.is_verified,
      verificationStatus: u.verification_status || (u.is_verified ? 'Approved' : 'Pending'),
      carPic: u.car_pic,
      licenseUrl: u.license_url
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error("Admin Users Fetch Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}