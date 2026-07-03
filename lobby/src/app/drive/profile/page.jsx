"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Car, CheckCircle2, Loader2, MapPin, Phone, ShieldCheck } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function DriverProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [driver, setDriver] = useState(null);
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

    async function loadDriver() {
      try {
        const res = await fetch(`${API_BASE_URL}/driver/${user.id}`);
        const json = await res.json();
        if (json.success) setDriver(json.driver);
      } catch (error) {
        console.error('Failed to load driver profile', error);
      } finally {
        setLoading(false);
      }
    }

    loadDriver();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-semibold text-slate-400">
        <Loader2 className="mr-2 animate-spin" />
        Loading profile...
      </div>
    );
  }

  const routes = driver?.routes && driver.routes.length > 0 ? driver.routes : ['No routes listed'];
  const isVerified = driver?.isVerified === true;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:rounded-[2rem]">
          <div className="relative h-44 bg-gradient-to-br from-[#DCFCE7] via-[#F8FAFC] to-[#BFDBFE] sm:h-56">
            {driver?.carPic && (
              <Image
                src={driver.carPic}
                alt={`${driver.fullName || 'Driver'} vehicle`}
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
              />
            )}
          </div>

          <div className="p-5 sm:p-8">
            <div className="-mt-16 mb-5 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-900 text-white shadow-lg sm:h-28 sm:w-28">
                  {driver?.profilePic || user?.imageUrl ? (
                    <Image
                      src={driver?.profilePic || user.imageUrl}
                      alt={driver?.fullName || 'Driver'}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                      {driver?.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'D'}
                    </div>
                  )}
                </div>

                <div className="pb-1">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {driver?.fullName || user?.fullName || 'Driver'}
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[#0F766E]">
                        <ShieldCheck size={16} />
                        Verified Driver
                      </span>
                    ) : (
                      <span>Pending Approval</span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span>{driver?.isAvailable ? 'Online' : 'Offline'}</span>
                  </p>
                </div>
              </div>

              <Link
                href="/drive/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-100 transition hover:bg-[#115E59]"
              >
                Edit Details
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile icon={Car} label="Vehicle" value={driver?.vehicle || 'Not added'} />
              <InfoTile icon={Phone} label="Phone" value={driver?.phone || 'Not added'} />
              <InfoTile icon={CheckCircle2} label="Status" value={driver?.verificationStatus || 'Pending'} />
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Routes
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {routes.map((route) => (
              <span
                key={route}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
              >
                <MapPin size={15} className="text-[#0F766E]" />
                {route}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0F766E] shadow-sm">
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
