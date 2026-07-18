import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const ALLOWED_EVENT_TYPES = new Set(['search', 'profile_view', 'call_click', 'whatsapp_click']);
const CONTACT_EVENT_TYPES = new Set(['call_click', 'whatsapp_click']);
const OPTIONAL_ANALYTICS_COLUMNS = new Set(['lead_status', 'destination', 'requested_stand', 'vehicle_type_filter']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request) {
  const limited = await rateLimit(request, {
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
    if (type === 'search') {
      eventRow.destination = cleanString(body.destination, 160) || null;
      eventRow.requested_stand = cleanString(body.taxiStand, 120) || null;
      eventRow.vehicle_type_filter = cleanString(body.vehicleTypeFilter, 40) || null;
    }

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
