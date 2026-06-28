import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  // You will get this secret from the Clerk Dashboard later
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Webhook secret is not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
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
    return new Response('Error occurred', { status: 400 });
  }

  // --- HANDLE THE EVENT ---
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await connectDB();
    
    await User.findOneAndUpdate(
      { clerkId: id },
      {
        $setOnInsert: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
          role: 'rider',
        },
      },
      { upsert: true }
    );
  }

  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
}
