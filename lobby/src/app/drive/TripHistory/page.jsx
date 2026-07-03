"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Clock3, Loader2, PhoneCall, Route } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function DriverTripHistoryPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalCalls: 0, callsToday: 0, callsThisWeek: 0 });
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
        }
      } catch (error) {
        console.error('Failed to load trip history', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoaded, isSignedIn, user, router]);

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
        <section className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                Trip History
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Rider calls and recent activity
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {stats.totalCalls} total rider calls recorded.
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

        {history.length === 0 ? (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 px-5 py-14 text-center shadow-sm backdrop-blur-sm sm:rounded-[2rem]">
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
          <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:p-6">
            <div className="space-y-3">
              {history.map((event) => (
                <article
                  key={event._id}
                  className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#0F766E]">
                    <PhoneCall size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold tracking-tight text-slate-900">
                      {event.rider?.fullName || 'Rider'}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Clock3 size={13} />
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
