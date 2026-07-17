import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { formatBooking } from '@/lib/supabaseFormat';

export async function GET(req) {
  try {
    // 1. Securely get the logged-in rider's ID from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all bookings requested by this rider, newest first
    const { data: history, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('rider_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, history: (history || []).map((ride) => formatBooking(ride)) });

  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}
