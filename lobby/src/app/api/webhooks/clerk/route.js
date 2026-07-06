import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase'; // The file we created in Phase 3
import { NextResponse } from 'next/server';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return new Response('Missing Secret', { status: 500 });

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, first_name, last_name } = evt.data;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    // SUPABASE INSERT
    const { error } = await supabase
      .from('users')
      .insert([
        {
          clerk_id: id,
          full_name: fullName,
          role: 'rider', // default
          is_verified: false,
          is_available: false
        }
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}