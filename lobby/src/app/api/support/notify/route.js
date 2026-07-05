import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function cleanString(value, maxLength = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'support-notify',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (limited) return limited;

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const body = await request.json();
    const firstName = cleanString(body.firstName, 80);
    const lastName = cleanString(body.lastName, 80);
    const email = cleanString(body.email, 254);
    const topic = cleanString(body.topic, 160);
    const message = cleanString(body.message, 5000);

    if (!firstName || !lastName || !email || !topic || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, topic, and message are required' },
        { status: 400 }
      );
    }

    const web3FormsResponse = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Support Message from ${firstName}`,
        from_name: 'Lobby App Support',
        firstName,
        lastName,
        email,
        topic,
        message,
      }),
    });

    const result = await web3FormsResponse.json();
    if (!web3FormsResponse.ok || !result.success) {
      return NextResponse.json(
        { success: false, message: 'Support email notification failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support email notification failed:', error);
    return NextResponse.json(
      { success: false, message: 'Support email notification failed' },
      { status: 500 }
    );
  }
}
