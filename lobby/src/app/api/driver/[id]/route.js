import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';

export async function GET(request, context) {
  try {
    const params = await context.params;

    // Search Supabase using the clerk_id
    const { data: driver, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', params.id)
      .single();

    if (error || !driver) {
      return NextResponse.json({ success: false, message: "Driver not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, driver: formatUser(driver) }, { status: 200 });
  } catch (error) {
    console.error("Driver lookup failed:", error);
    return NextResponse.json({ success: false, message: "Unable to load profile" }, { status: 500 });
  }
}
