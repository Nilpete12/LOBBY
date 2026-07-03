"use client";
import Image from 'next/image';
import { Search, MapPin, Star, Phone, X, Car, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SearchResultsSkeletons } from '@/components/SkeletonLoader';
import API_BASE_URL from '@/config';

const FILTERS = ['All Rides', 'Hatchback', 'SUV', 'Top Rated'];

function getInitialSearchQuery() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

async function requestDrivers(query = '') {
  const params = new URLSearchParams();
  if (query.trim()) params.set('destination', query.trim());

  const url = `${API_BASE_URL}/driver/search${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.success && Array.isArray(data.drivers)) {
    return data.drivers;
  }

  return [];
}

export default function SearchPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Rides');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [toast, setToast] = useState('');

  const visibleDrivers = useMemo(() => {
    if (activeFilter === 'Top Rated') {
      return [...drivers].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    if (activeFilter === 'Hatchback' || activeFilter === 'SUV') {
      return drivers.filter((driver) =>
        (driver.vehicle || '').toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    return drivers;
  }, [activeFilter, drivers]);

  const fetchDrivers = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      setDrivers(await requestDrivers(query));
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect to server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch Drivers on Load
  useEffect(() => {
    let isMounted = true;

    async function loadInitialDrivers() {
      const initialQuery = getInitialSearchQuery();
      try {
        const initialDrivers = await requestDrivers(initialQuery);
        if (isMounted) setDrivers(initialDrivers);
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) setError("Could not connect to server. Is it running?");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();

    if (query) params.set('q', query);

    setActiveFilter('All Rides');
    setSelectedDriver(null);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    fetchDrivers(query);
  };

  const trackCall = async (driver) => {
    setToast(`${driver.fullName || 'Driver'} added to recent contacts`);

    if (!driver?._id) return;

    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call_click',
          driverId: driver._id,
          riderId: user?.id || null
        })
      });
    } catch (err) {
      console.error("Tracking failed", err);
    }
  };

  useEffect(() => {
    if (!selectedDriver) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedDriver(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDriver]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-3xl">
        
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Find a Ride</h1>
          <form action="/search" onSubmit={handleSearch} className="relative flex items-center">
            <MapPin className="absolute left-4 text-slate-400" size={20} />
            <input 
              type="text" 
              name="q"
              aria-label="Destination"
              placeholder="Where do you want to go? (e.g. Dawki)" 
              className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-14 text-base font-medium shadow-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 sm:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Search drivers"
              disabled={loading}
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 sm:mb-8">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeFilter === filter
                  ? 'border-[#0F766E] bg-[#DCFCE7] text-[#0F766E]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results Area */}
        {loading ? (
          <SearchResultsSkeletons count={3} />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 py-16 text-center sm:py-20">
            <div className="mb-4 inline-flex rounded-full bg-red-100 p-4 text-red-400">
              <Search size={32} />
            </div>
            <p className="text-lg font-bold text-red-600">{error}</p>
            <p className="mt-2 text-sm text-red-500">Please check your connection and try again.</p>
          </div>
        ) : visibleDrivers.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <div className="mb-4 inline-flex rounded-full bg-slate-100 p-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {drivers.length === 0 ? 'No active drivers found' : `No ${activeFilter.toLowerCase()} drivers found`}
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-slate-500">
              {drivers.length === 0
                ? 'Try searching for a different location or check back later.'
                : 'Try another search or switch back to all rides.'}
            </p>
            {activeFilter !== 'All Rides' && (
              <button
                onClick={() => setActiveFilter('All Rides')}
                className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
              >
                Show All Rides
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleDrivers.map((driver) => (
              <DriverResultCard
                key={driver._id || driver.id}
                driver={driver}
                onSelect={() => setSelectedDriver(driver)}
              />
            ))}
          </div>
        )}

      </div>

      {selectedDriver && (
        <DriverDetailsSheet
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onCall={() => trackCall(selectedDriver)}
        />
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-28 z-[60] mx-auto max-w-sm rounded-2xl border border-[#DCFCE7] bg-white px-4 py-3 text-center text-sm font-bold text-[#0F766E] shadow-xl shadow-slate-900/10 md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function getDriverRoutes(driver) {
  return driver.routes && driver.routes.length > 0 ? driver.routes : ['Local City Run'];
}

function getDriverInitial(driver) {
  return driver.fullName?.charAt(0) || 'D';
}

function DriverAvatar({ driver, size = 64 }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-slate-900 text-white shadow-sm"
      style={{ width: size, height: size }}
    >
      {driver.profilePic ? (
        <Image
          src={driver.profilePic}
          alt={driver.fullName || 'Driver'}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-xl font-bold">
          {getDriverInitial(driver)}
        </div>
      )}
    </div>
  );
}

function DriverResultCard({ driver, onSelect }) {
  const vehicle = driver.vehicle || 'Standard Taxi';
  const routes = getDriverRoutes(driver);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-[#0F766E]/20 hover:shadow-lg sm:p-5"
    >
      <div className="flex gap-3 sm:gap-4">
        <DriverAvatar driver={driver} size={60} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 transition group-hover:text-[#0F766E]">
                {driver.fullName || 'Driver'}
              </h3>
              
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {driver.rating || 5.0}
                </span>
                <span className="truncate">• {vehicle}</span>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#0F766E]">
              View
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {routes.slice(0, 2).map((route) => (
              <span
                key={route}
                className="flex max-w-full items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500"
              >
                <MapPin size={12} />
                <span className="truncate">{route}</span>
              </span>
            ))}
            {routes.length > 2 && (
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                +{routes.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function DriverDetailsSheet({ driver, onClose, onCall }) {
  const vehicle = driver.vehicle || 'Standard Taxi';
  const routes = getDriverRoutes(driver);
  const phoneHref = driver.phone ? `tel:${driver.phone}` : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden"></div>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <DriverAvatar driver={driver} size={68} />

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                {driver.fullName || 'Driver'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-slate-900">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {driver.rating || 5.0}
                </span>
                <span>•</span>
                <span>{vehicle}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close driver details"
          >
            <X size={20} />
          </button>
        </div>

        {driver.carPic && (
          <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={driver.carPic}
              alt={`${driver.fullName || 'Driver'} vehicle`}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0F766E] shadow-sm">
              <Car size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Vehicle</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{vehicle}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0F766E] shadow-sm">
              <Phone size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Phone</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{driver.phone || 'Unavailable'}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase text-slate-400">Routes</p>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <span
                key={route}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
              >
                <MapPin size={12} />
                {route}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          {phoneHref ? (
            <a
              href={phoneHref}
              onClick={onCall}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-100 transition hover:bg-[#115E59]"
            >
              <Phone size={18} />
              Call Driver
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-2xl bg-slate-200 px-4 py-4 text-sm font-bold text-slate-400"
            >
              Phone Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
