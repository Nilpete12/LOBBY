import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { logAdminActivity } from '@/lib/adminActivity';
import { missingColumnName } from '@/lib/supabaseColumnFallback';

const EXPORTS = {
  drivers: {
    table: 'users',
    fileName: 'lobby-drivers.csv',
    columns: ['id', 'clerk_id', 'full_name', 'email', 'phone', 'vehicle', 'vehicle_type', 'vehicle_plate', 'taxi_stands', 'current_stand', 'is_available', 'is_verified', 'account_status', 'subscription_status', 'subscription_paid_until', 'created_at'],
    apply: (query) => query.eq('role', 'driver'),
  },
  riders: {
    table: 'users',
    fileName: 'lobby-riders.csv',
    columns: ['id', 'clerk_id', 'full_name', 'email', 'phone', 'account_status', 'created_at'],
    apply: (query) => query.eq('role', 'rider'),
  },
  bookings: {
    table: 'bookings',
    fileName: 'lobby-bookings.csv',
    columns: ['id', 'rider_id', 'rider_name', 'rider_phone', 'driver_id', 'destination', 'requested_stand', 'pickup_address', 'status', 'accepted_at', 'created_at', 'updated_at'],
  },
  complaints: {
    table: 'complaints',
    fileName: 'lobby-complaints.csv',
    columns: ['id', 'user_id', 'name', 'email', 'role', 'topic', 'report_type', 'driver_id', 'driver_name', 'status', 'message', 'created_at', 'updated_at'],
  },
  verifications: {
    table: 'verification_requests',
    fileName: 'lobby-verifications.csv',
    columns: ['id', 'driver_id', 'clerk_id', 'driver_name', 'status', 'license_url', 'review_notes', 'reviewed_at', 'created_at', 'updated_at'],
  },
  activity: {
    table: 'admin_activity_logs',
    fileName: 'lobby-admin-activity.csv',
    columns: ['id', 'action', 'target_type', 'target_id', 'target_label', 'summary', 'created_at'],
  },
  analytics: {
    table: 'analytics',
    fileName: 'lobby-analytics.csv',
    columns: ['id', 'event_type', 'driver_id', 'rider_id', 'lead_status', 'driver_outcome', 'rider_outcome', 'created_at'],
  },
};

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const normalized = Array.isArray(value) || typeof value === 'object'
    ? JSON.stringify(value)
    : String(value);

  return /[",\n\r]/.test(normalized)
    ? `"${normalized.replaceAll('"', '""')}"`
    : normalized;
}

function rowsToCsv(rows, columns) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n');
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'drivers';
  const config = EXPORTS[type];

  if (!config) {
    return NextResponse.json({ success: false, message: 'Unsupported export type' }, { status: 400 });
  }

  try {
    let columns = [...config.columns];
    let data = [];

    for (let attempt = 0; attempt <= config.columns.length; attempt += 1) {
      let query = supabaseAdmin
        .from(config.table)
        .select(columns.join(','))
        .order('created_at', { ascending: false })
        .limit(5000);

      if (config.apply) query = config.apply(query);

      const result = await query;
      if (!result.error) {
        data = result.data || [];
        break;
      }

      const missingColumn = missingColumnName(result.error);
      if (!missingColumn || !columns.includes(missingColumn)) throw result.error;

      columns = columns.filter((column) => column !== missingColumn);
    }

    await logAdminActivity({
      action: 'admin.export',
      targetType: config.table,
      targetId: type,
      targetLabel: config.fileName,
      summary: `Exported ${data.length} ${type} rows`,
      metadata: { type, rowCount: data.length },
    });

    return new NextResponse(rowsToCsv(data, columns), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${config.fileName}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Admin export failed:', error);
    return NextResponse.json({ success: false, message: 'Export failed' }, { status: 500 });
  }
}
