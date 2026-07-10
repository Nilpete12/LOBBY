import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const ALLOWED_EVENT_TYPES = new Set(['profile_view', 'call_click', 'whatsapp_click']);
const CONTACT_EVENT_TYPES = new Set(['call_click', 'whatsapp_click']);
const OPTIONAL_ANALYTICS_COLUMNS = new Set(['lead_status']);

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'analytics-track',
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (limited) return limited;

  try {
    const body = await request.json();
    const type = typeof body.type === 'string' ? body.type : '';

    if (!ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, message: 'Unsupported analytics event' },
        { status: 400 }
      );
    }

    const eventRow = {
      event_type: type,
      driver_id: body.driverId || null,
      rider_id: body.riderId || null,
    };

    if (CONTACT_EVENT_TYPES.has(type)) eventRow.lead_status = 'pending';

    const event = await writeWithColumnFallback(
      eventRow,
      OPTIONAL_ANALYTICS_COLUMNS,
      (row) => supabaseAdmin.from('analytics').insert(row).select('id').single()
    );

    return NextResponse.json(
      {
        success: true,
        eventId: event?.id || null,
        leadId: CONTACT_EVENT_TYPES.has(type) ? event?.id || null : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Analytics Tracking Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to track event' }, { status: 200 });
  }
}
