import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function currentSurveyMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function formatSurvey(row = null) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    driverId: row.driver_id,
    clerkId: row.clerk_id,
    surveyMonth: row.survey_month,
    estimatedCompletedRides: row.estimated_completed_rides,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isMissingSurveyTable(error = {}) {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return text.includes('driver_monthly_surveys') && (text.includes('does not exist') || text.includes('schema cache'));
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const estimatedCompletedRides = Math.max(0, Math.min(5000, Number.parseInt(body.estimatedCompletedRides, 10) || 0));
    const notes = cleanString(body.notes, 500);
    const surveyMonth = currentSurveyMonth();

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

    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('driver_monthly_surveys')
      .upsert(
        {
          driver_id: driver.id,
          clerk_id: driver.clerk_id,
          survey_month: surveyMonth,
          estimated_completed_rides: estimatedCompletedRides,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_id,survey_month' }
      )
      .select()
      .single();

    if (surveyError) {
      if (isMissingSurveyTable(surveyError)) {
        return NextResponse.json(
          { success: false, message: 'Monthly survey storage is not set up yet. Please run the driver_monthly_surveys migration.' },
          { status: 500 }
        );
      }

      throw surveyError;
    }

    return NextResponse.json({ success: true, survey: formatSurvey(survey) });
  } catch (error) {
    console.error('Monthly driver survey failed:', error);
    return NextResponse.json(
      { success: false, message: 'Could not save monthly survey' },
      { status: 500 }
    );
  }
}
