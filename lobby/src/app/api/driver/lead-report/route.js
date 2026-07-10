import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const ALLOWED_OUTCOMES = new Set(['completed', 'no_trip', 'missed']);
const CONTACT_EVENTS = new Set(['call_click', 'whatsapp_click']);
const OPTIONAL_LEAD_COLUMNS = new Set([
  'lead_status',
  'driver_outcome',
  'driver_reported_at',
  'driver_outcome_notes',
]);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function leadStatusForOutcome(outcome, lead) {
  if (outcome === 'completed' && lead.rider_outcome === 'completed') return 'confirmed_completed';
  if (outcome === 'completed') return 'driver_reported_completed';
  if (outcome === 'missed') return 'driver_reported_missed';
  return 'driver_reported_no_trip';
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const leadId = cleanString(body.leadId, 120);
    const outcome = cleanString(body.outcome, 40);
    const notes = cleanString(body.notes, 500);

    if (!leadId || !ALLOWED_OUTCOMES.has(outcome)) {
      return NextResponse.json(
        { success: false, message: 'Invalid lead report' },
        { status: 400 }
      );
    }

    const { data: driver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('id,clerk_id,role')
      .eq('clerk_id', userId)
      .eq('role', 'driver')
      .maybeSingle();

    if (driverError) throw driverError;
    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('id', leadId)
      .eq('driver_id', driver.id)
      .maybeSingle();

    if (leadError) throw leadError;
    if (!lead || !CONTACT_EVENTS.has(lead.event_type)) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      );
    }

    const updates = {
      lead_status: leadStatusForOutcome(outcome, lead),
      driver_outcome: outcome,
      driver_reported_at: new Date().toISOString(),
      driver_outcome_notes: notes,
    };

    const updatedLead = await writeWithColumnFallback(
      updates,
      OPTIONAL_LEAD_COLUMNS,
      (row) => supabaseAdmin.from('analytics').update(row).eq('id', lead.id).select('*').single()
    );

    return NextResponse.json({
      success: true,
      lead: {
        _id: updatedLead.id,
        leadStatus: updatedLead.lead_status,
        driverOutcome: updatedLead.driver_outcome,
        driverReportedAt: updatedLead.driver_reported_at,
        riderOutcome: updatedLead.rider_outcome,
        riderReportedAt: updatedLead.rider_reported_at,
      },
    });
  } catch (error) {
    console.error('Driver lead report failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not update lead report' },
      { status: 500 }
    );
  }
}
