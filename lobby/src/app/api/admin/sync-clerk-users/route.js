import { NextResponse } from 'next/server';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';
import { logAdminActivity } from '@/lib/adminActivity';
import { syncAllClerkUsersToSupabase } from '@/lib/clerkUserSync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function adminJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export async function POST() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const result = await syncAllClerkUsersToSupabase();

    await logAdminActivity({
      action: 'users.sync_clerk',
      targetType: 'system',
      targetId: 'clerk',
      targetLabel: 'Clerk users',
      summary: `Synced ${result.total} Clerk users`,
      metadata: result,
    });

    return adminJson({ success: true, ...result });
  } catch (error) {
    console.error('Failed to sync Clerk users:', error);
    return adminJson(
      { success: false, message: 'Failed to sync Clerk users' },
      { status: 500 }
    );
  }
}
