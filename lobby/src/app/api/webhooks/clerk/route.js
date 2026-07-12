import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncClerkUserToSupabase } from '@/lib/clerkUserSync';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CRITICAL: Missing CLERK_WEBHOOK_SECRET env variable.');
    return new Response('Webhook configuration error', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // 1. Guard Clause: Block request immediately if headers are completely absent
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix security signatures', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  // 2. Strict Signature Verification Block
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('CRITICAL: Webhook signature verification failed spoofing attempt blocked:', err.message);
    // Explicitly return 400 to break execution. DO NOT let the user continue down the route!
    return new Response('Invalid webhook token signature signature', { status: 400 });
  }

  const eventType = evt.type;

  // 3. Authenticated Mutations Block
  if (eventType === 'user.created' || eventType === 'user.updated') {
    try {
      await syncClerkUserToSupabase(evt.data);
    } catch (error) {
      console.error("Supabase user sync error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const deleteResults = await Promise.all([
      supabase.from('users').delete().eq('clerk_id', evt.data.id),
      supabase.from('verification_requests').delete().eq('clerk_id', evt.data.id),
      supabase.from('bookings').delete().or(`rider_id.eq.${evt.data.id},driver_id.eq.${evt.data.id}`),
    ]);

    const deleteError = deleteResults.find((result) => result.error)?.error;
    if (deleteError) {
      console.error("Supabase user structural delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}