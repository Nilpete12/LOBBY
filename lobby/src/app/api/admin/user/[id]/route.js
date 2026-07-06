import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(req, context) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const params = await context.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Convert snake_case back to camelCase
    const formattedUser = {
      ...data,
      _id: data.id,
      clerkId: data.clerk_id,
      fullName: data.full_name,
      isVerified: data.is_verified,
      verificationStatus: data.verification_status || 'Pending',
      carPic: data.car_pic,
      licenseUrl: data.license_url
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching user' }, { status: 500 });
  }
}