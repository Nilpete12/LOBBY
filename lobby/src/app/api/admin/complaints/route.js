import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { adminUnauthorized, isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    await supabase.connect();
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error('Failed to load complaints:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load complaints' },
      { status: 500 }
    );
  }
}
