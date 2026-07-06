import { supabase } from '@/lib/supabase';

export async function logAdminActivity({
  action,
  targetType = '',
  targetId = '',
  targetLabel = '',
  summary,
  metadata = {},
}) {
  try {
    await supabase.from('admin_activity_logs').insert({
      actor: process.env.ADMIN_EMAIL || 'admin',
      action,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      summary,
      metadata,
    });
  } catch (error) {
    console.error('Failed to write admin activity log:', error);
  }
}
