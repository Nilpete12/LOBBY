import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatActivityLog } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(req) {
  // Protect the route
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const requestedLimit = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Math.min(100, Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : 100));

    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ success: true, logs: (data || []).map(formatActivityLog) });
  } catch (error) {
    console.error('Failed to fetch admin activity logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
