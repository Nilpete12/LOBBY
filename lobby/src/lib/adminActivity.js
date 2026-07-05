import AdminActivityLog from '@/models/AdminActivityLog';

export async function logAdminActivity({
  action,
  targetType = '',
  targetId = '',
  targetLabel = '',
  summary,
  metadata = {},
}) {
  try {
    await AdminActivityLog.create({
      actor: process.env.ADMIN_EMAIL || 'admin',
      action,
      targetType,
      targetId,
      targetLabel,
      summary,
      metadata,
    });
  } catch (error) {
    console.error('Failed to write admin activity log:', error);
  }
}
