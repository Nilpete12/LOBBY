"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, CheckCircle2, Clock3, Loader2, MessageCircle, PhoneCall, Route, XCircle } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function DriverTripHistoryPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalCalls: 0, callsToday: 0, callsThisWeek: 0 });
  const [monthlySurvey, setMonthlySurvey] = useState(null);
  const [surveyRides, setSurveyRides] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [surveySaving, setSurveySaving] = useState(false);
  const [workingLeadId, setWorkingLeadId] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!user?.publicMetadata?.role) {
      router.push('/onboarding');
      return;
    }

    if (user.publicMetadata.role !== 'driver') {
      router.push('/account');
      return;
    }

    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE_URL}/driver/history`);
        const json = await res.json();
        if (json.success) {
          setHistory(json.history || []);
          setStats(json.stats || { totalCalls: 0, callsToday: 0, callsThisWeek: 0 });
          setMonthlySurvey(json.monthlySurvey || null);
          if (json.monthlySurvey?.submitted) {
            setSurveyRides(String(json.monthlySurvey.estimatedCompletedRides || 0));
            setSurveyNotes(json.monthlySurvey.notes || '');
          }
        }
      } catch (error) {
        console.error('Failed to load trip history', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const reportLeadOutcome = async (leadId, outcome) => {
    if (!leadId || workingLeadId) return;
    setWorkingLeadId(leadId);

    try {
      const res = await fetch(`${API_BASE_URL}/driver/lead-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, outcome }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Lead report failed');

      setHistory((current) =>
        current.map((event) =>
          event._id === leadId
            ? {
                ...event,
                leadStatus: data.lead?.leadStatus || event.leadStatus,
                driverOutcome: data.lead?.driverOutcome || outcome,
                driverReportedAt: data.lead?.driverReportedAt || new Date().toISOString(),
                riderOutcome: data.lead?.riderOutcome || event.riderOutcome,
                riderReportedAt: data.lead?.riderReportedAt || event.riderReportedAt,
              }
            : event
        )
      );
      setNotice('Lead report saved.');
    } catch (error) {
      console.error('Lead report failed', error);
      setNotice(error.message || 'Could not save lead report.');
    } finally {
      setWorkingLeadId('');
    }
  };

  const submitMonthlySurvey = async (event) => {
    event.preventDefault();
    setSurveySaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/driver/monthly-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimatedCompletedRides: surveyRides,
          notes: surveyNotes,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Survey failed');

      setMonthlySurvey({ ...data.survey, submitted: true });
      setNotice('Monthly survey saved.');
    } catch (error) {
      console.error('Monthly survey failed', error);
      setNotice(error.message || 'Could not save monthly survey.');
    } finally {
      setSurveySaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-semibold text-slate-400">
        <Loader2 className="mr-2 animate-spin" />
        Loading trip history...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                Trip History
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Rider calls and recent activity
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {stats.totalCalls} total rider calls recorded. Calls are not recorded, only button taps and optional reports.
              </p>
            </div>

            <Link
              href="/drive/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-100 transition hover:bg-[#115E59]"
            >
              Dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {notice && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {notice}
          </div>
        )}

        <MonthlySurveyCard
          survey={monthlySurvey}
          rides={surveyRides}
          notes={surveyNotes}
          saving={surveySaving}
          onRidesChange={setSurveyRides}
          onNotesChange={setSurveyNotes}
          onSubmit={submitMonthlySurvey}
        />

        {history.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white/85 px-5 py-14 text-center shadow-sm backdrop-blur-sm sm:rounded-4xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Route size={30} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              No rider calls yet
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-slate-500">
              Recent rider contact activity will appear here.
            </p>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-6">
            <div className="space-y-3">
              {history.map((event) => (
                <HistoryItem
                  key={event._id}
                  event={event}
                  working={workingLeadId === event._id}
                  onReport={reportLeadOutcome}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MonthlySurveyCard({
  survey,
  rides,
  notes,
  saving,
  onRidesChange,
  onNotesChange,
  onSubmit,
}) {
  const submitted = Boolean(survey?.submitted);

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
            Monthly driver survey
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Estimate completed Lobby rides
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            This helps compare call clicks with real-world trips without recording calls.
          </p>
        </div>
        {submitted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            <CheckCircle2 size={14} />
            Submitted
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-slate-400">Completed rides</span>
          <input
            type="number"
            min="0"
            value={rides}
            onChange={(event) => onRidesChange(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-900 outline-none focus:border-[#0F766E]"
            placeholder="0"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-slate-400">Notes</span>
          <input
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-[#0F766E]"
            placeholder="Optional: busy stands, common routes, issues"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitted ? 'Update' : 'Submit'}
        </button>
      </form>
    </section>
  );
}

function HistoryItem({ event, working, onReport }) {
  const isWhatsApp = event.type === 'whatsapp_click';
  const Icon = isWhatsApp ? MessageCircle : PhoneCall;
  const driverOutcomeLabel = {
    completed: 'Driver marked completed',
    no_trip: 'Driver marked no trip',
    missed: 'Driver missed this lead',
  }[event.driverOutcome];
  const riderOutcomeLabel = {
    completed: 'Rider confirmed completed',
    not_completed: 'Rider said no trip',
  }[event.riderOutcome];

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#0F766E]">
          <Icon size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold tracking-tight text-slate-900">
            {event.rider?.fullName || 'Rider'}
          </h2>
          <p className="mt-1 text-xs font-bold text-[#0F766E]">
            {isWhatsApp ? 'WhatsApp click' : 'Call click'}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Clock3 size={13} />
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {driverOutcomeLabel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            <CheckCircle2 size={13} />
            {driverOutcomeLabel}
          </span>
        )}
        {riderOutcomeLabel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            <CheckCircle2 size={13} />
            {riderOutcomeLabel}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onReport(event._id, 'completed')}
          disabled={working}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-2xl bg-emerald-50 px-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          Completed
        </button>
        <button
          type="button"
          onClick={() => onReport(event._id, 'no_trip')}
          disabled={working}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-2xl bg-slate-100 px-2 text-xs font-black text-slate-600 disabled:opacity-50"
        >
          <XCircle size={14} />
          No trip
        </button>
        <button
          type="button"
          onClick={() => onReport(event._id, 'missed')}
          disabled={working}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-2xl bg-amber-50 px-2 text-xs font-black text-amber-700 ring-1 ring-amber-100 disabled:opacity-50"
        >
          <Clock3 size={14} />
          Missed
        </button>
      </div>
    </article>
  );
}
