import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { formatUser } from '@/lib/supabaseFormat';

export async function GET(req) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabaseAdmin
      .from('users')
      .select('*')
      .limit(limit);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    const formattedUsers = users.map(formatUser);

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('[Admin Users API] Error fetching users:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch users',
        ...(isDev && { error: error.message })
      }, 
      { status: 500 }
    );
  }
}
