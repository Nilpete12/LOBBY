import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const ALLOWED_OUTCOMES = new Set(['completed', 'not_completed']);
const CONTACT_EVENTS = new Set(['call_click', 'whatsapp_click']);
const OPTIONAL_LEAD_COLUMNS = new Set(['lead_status', 'rider_outcome', 'rider_reported_at']);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function leadStatusForOutcome(outcome) {
  return outcome === 'completed' ? 'rider_confirmed_completed' : 'rider_reported_no_trip';
}

export async function POST(request) {
  const limited = rateLimit(request, {
    keyPrefix: 'lead-outcome',
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (limited) return limited;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const leadId = cleanString(body.leadId, 120);
  const riderId = cleanString(body.riderId, 160);
  const outcome = cleanString(body.outcome, 40);

  if (!leadId || !ALLOWED_OUTCOMES.has(outcome)) {
    return NextResponse.json(
      { success: false, message: 'Invalid lead follow-up' },
      { status: 400 }
    );
  }

  try {
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('id', leadId)
      .maybeSingle();

    if (leadError) throw leadError;
    if (!lead || !CONTACT_EVENTS.has(lead.event_type)) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    if (lead.rider_id && lead.rider_id !== riderId) {
      return NextResponse.json(
        { success: false, message: 'This lead belongs to another rider session' },
        { status: 403 }
      );
    }

    const updates = {
      lead_status: leadStatusForOutcome(outcome),
      rider_outcome: outcome,
      rider_reported_at: new Date().toISOString(),
    };

    await writeWithColumnFallback(
      updates,
      OPTIONAL_LEAD_COLUMNS,
      (row) => supabaseAdmin.from('analytics').update(row).eq('id', lead.id).select('id').single()
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead outcome update failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not save ride follow-up' },
      { status: 500 }
    );
  }
}
