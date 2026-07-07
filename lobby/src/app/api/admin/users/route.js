import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(req) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Extract query parameters (UserTable might pass a role or limit filter)
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build the Supabase query
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply role filter if the dashboard tab requires it
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    // Map the database columns so the frontend table maps them correctly
    const formattedUsers = users.map(u => ({
      id: u.id,
      clerkId: u.clerk_id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isVerified: u.is_verified,
      isAvailable: u.is_available,
      accountStatus: u.account_status || 'active',
      createdAt: u.created_at
    }));

    return NextResponse.json({ success: true, users: formattedUsers });

  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}