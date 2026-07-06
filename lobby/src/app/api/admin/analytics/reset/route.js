import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function DELETE() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const { count, error } = await supabase
      .from('analytics')
      .delete({ count: 'exact' })
      .not('id', 'is', null);

    if (error) throw error;

    await logAdminActivity({
      action: 'analytics.reset',
      targetType: 'analytics',
      targetId: 'all',
      targetLabel: 'Analytics',
      summary: `Reset analytics data (${count || 0} records)`,
    });

    return NextResponse.json({
      success: true,
      deletedCount: count || 0,
    });
  } catch (error) {
    console.error('Failed to reset analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset analytics data' },
      { status: 500 }
    );
  }
}
