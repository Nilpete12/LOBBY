import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Optional: Attach the Clerk ID if the user is currently logged in
    const { userId } = auth();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Insert the support ticket into Postgres
    const { error } = await supabase
      .from('complaints')
      .insert([
        {
          user_id: userId || null,
          name: name,
          email: email,
          subject: subject || 'General Support',
          message: message,
          status: 'pending'
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Support ticket submitted successfully' });
    
  } catch (error) {
    console.error("Support Submission Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to submit support ticket' }, { status: 500 });
  }
}