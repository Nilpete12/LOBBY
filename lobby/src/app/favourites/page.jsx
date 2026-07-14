"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Hash, Heart, MapPin, Phone, Search, Star, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'lobby:favourite-drivers';

function loadFavourites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function FavouritesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [favourites, setFavourites] = useState(() =>
    typeof window === 'undefined' ? [] : loadFavourites()
  );

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

    if (user.publicMetadata.role === 'driver') {
      router.push('/drive/dashboard');
      return;
    }
  }, [isLoaded, isSignedIn, user, router]);

  const removeFavourite = (driverId) => {
    const next = favourites.filter((driver) => (driver._id || driver.id) !== driverId);
    setFavourites(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF7ED] font-semibold text-slate-400">
        Loading favourites...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7ED] px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-4xl">
        <section className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Heart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Favourite Drivers
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Your saved local drivers in one place.
              </p>
            </div>
          </div>
        </section>

        {favourites.length === 0 ? (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 px-5 py-14 text-center shadow-sm backdrop-blur-sm sm:rounded-[2rem]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Heart size={30} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              No favourites saved yet
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-slate-500">
              Find a driver and keep the ones you trust close.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58A6FF] px-6 py-3 font-bold text-slate-950 shadow-lg shadow-[#58A6FF]/20 transition hover:bg-[#2F80ED] sm:w-auto"
            >
              <Search size={18} />
              Find a Ride
            </Link>
          </section>
        ) : (
          <section className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {favourites.map((driver) => {
              const driverId = driver._id || driver.id;
              const routes = Array.isArray(driver.routes) && driver.routes.length > 0
                ? driver.routes
                : ['Local City Run'];

              return (
                <article
                  key={driverId}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-lg sm:p-5"
                >
                  <div className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-900 text-white">
                      {driver.profilePic ? (
                        <Image
                          src={driver.profilePic}
                          alt={driver.fullName || 'Driver'}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                          {driver.fullName?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-bold tracking-tight text-slate-900">
                            {driver.fullName || 'Driver'}
                          </h2>
                          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-500">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            {driver.rating || 5.0}
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{driver.vehicle || 'Standard Taxi'}</span>
                          </p>
                          {driver.vehiclePlate && (
                            <p className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-slate-700">
                              <Hash size={11} />
                              <span className="truncate">{driver.vehiclePlate}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFavourite(driverId)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          aria-label="Remove favourite"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {routes.slice(0, 2).map((route) => (
                          <span
                            key={route}
                            className="flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500"
                          >
                            <MapPin size={12} />
                            {route}
                          </span>
                        ))}
                      </div>

                      {driver.phone && (
                        <a
                          href={`tel:${driver.phone}`}
                          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#58A6FF] px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-[#58A6FF]/20 transition hover:bg-[#2F80ED]"
                        >
                          <Phone size={17} />
                          Call Driver
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
