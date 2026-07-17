import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanString(value, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function PATCH(_request, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Please sign in again.' }, { status: 401 });
    }

    const params = await context.params;
    const notificationId = cleanString(params?.id);
    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'Notification not found.' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('driver_notifications')
      .update({
        status: 'archived',
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('clerk_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, message: 'Notification not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to dismiss driver notification:', error);
    return NextResponse.json(
      { success: false, message: 'Could not dismiss this notification.' },
      { status: 500 }
    );
  }
}
