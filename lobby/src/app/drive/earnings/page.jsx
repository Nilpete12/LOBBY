"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Banknote, CalendarDays, Eye, Loader2, MessageCircle, PhoneCall, Wallet } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function DriverEarningsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [data, setData] = useState(null);
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
        if (json.success) setData(json);
      } catch (error) {
        console.error('Failed to load driver earnings data', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF7ED] font-semibold text-slate-400">
        <Loader2 className="mr-2 animate-spin" />
        Loading earnings...
      </div>
    );
  }

  const stats = data?.stats || { totalCalls: 0, callsToday: 0, callsThisWeek: 0 };

  return (
    <main className="lobby-dashboard-gradient min-h-screen px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2F80ED]">
                Driver Analytics
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Your monthly rider interest
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                Track the profile views and contact clicks that show your visibility on The Lobby.
              </p>
            </div>

            <Link
              href="/drive/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#58A6FF] px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-[#58A6FF]/20 transition hover:bg-[#2F80ED]"
            >
              Dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 sm:gap-4 font-[Sailors_Slant_Normal]">
          <StatCard icon={Eye} label="Profile views this month" value={stats.profileViewsThisMonth || 0} />
          <StatCard icon={PhoneCall} label="Call clicks this month" value={stats.callClicksThisMonth || 0} />
          <StatCard icon={MessageCircle} label="WhatsApp clicks this month" value={stats.whatsappClicksThisMonth || 0} />
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4 font-[Sailors_Slant_Normal]">
          <StatCard icon={PhoneCall} label="Total rider calls" value={stats.totalCalls} />
          <StatCard icon={CalendarDays} label="Calls today" value={stats.callsToday} />
          <StatCard icon={Wallet} label="Calls this week" value={stats.callsThisWeek} />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#2F80ED]">
              <Banknote size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                App-collected fare
              </h2>
              <p className="mt-2 text-4xl font-[Sailors_Slant_Normal] tracking-tight text-slate-900">
                ₹0
              </p>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                <span className="font-[Sailors_Slant_Normal]">The Lobby</span> does not collect trip payments from riders during this pilot.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFEDD5] text-[#2F80ED]">
        <Icon size={22} />
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
