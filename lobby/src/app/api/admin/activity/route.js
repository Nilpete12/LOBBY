import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatActivityLog } from '@/lib/supabaseFormat';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ success: true, logs: (data || []).map(formatActivityLog) });
  } catch (error) {
    console.error('Failed to load admin activity:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load admin activity' },
      { status: 500 }
    );
  }
}
