import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // 1. Correct named import!
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(req) {
  // Protect the route
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch the logs from your new Postgres table
    const { data: logs, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Convert Postgres snake_case back into the camelCase your frontend expects
    const formattedLogs = logs.map(log => ({
      ...log,
      _id: log.id, 
      targetType: log.target_type,
      targetId: log.target_id,
      targetLabel: log.target_label,
      createdAt: log.created_at
    }));

    return NextResponse.json({ success: true, logs: formattedLogs });

  } catch (error) {
    console.error('Failed to fetch admin activity logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch logs' }, 
      { status: 500 }
    );
  }
}