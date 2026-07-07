import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminAuthenticated, adminUnauthorized } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    // Fetch all users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Separate them into categories for your dashboard frontend
    // Change field names back to camelCase here so your frontend UI components don't break!
    const formattedUsers = users.map(u => ({
      id: u.id,
      clerkId: u.clerk_id,
      fullName: u.full_name,
      role: u.role,
      isVerified: u.is_verified,
      isAvailable: u.is_available,
      createdAt: u.created_at
    }));

    // Filter logic for dashboard UI cards
    const verificationQueue = formattedUsers.filter(u => u.role === 'driver' && !u.isVerified);
    const recentUsers = formattedUsers.slice(0, 5); // top 5 recent signups

    return NextResponse.json({
      success: true,
      verificationQueue,
      recentUsers,
      allUsers: formattedUsers
    });

  } catch (error) {
    console.error("Admin user fetch error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}