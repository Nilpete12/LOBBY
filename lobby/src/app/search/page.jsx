"use client";
import Image from 'next/image';
import { Search, MapPin, Star, Phone, X, Car, Loader2, Flag, MessageCircle, Hash, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SearchResultsSkeletons } from '@/components/SkeletonLoader';
import API_BASE_URL from '@/config';
import InstantBook from '@/components/InstantBook';
import TaxiStandDropdown from '@/components/TaxiStandDropdown';
import { normalizeVehicleType, vehicleTypeLabel } from '@/lib/vehicleTypes';
import { loadRecentDriverContacts, saveRecentDriverContact } from '@/lib/recentContacts';

const FILTERS = [
  { id: 'all', label: 'All Rides' },
  { id: 'hatchback', label: 'Hatchbacks' },
  { id: 'sedan', label: 'Sedans' },
  { id: 'suv', label: 'SUVs' },
  { id: 'two_wheeler', label: 'Two Wheelers' },
  { id: 'top_rated', label: 'Top Rated' },
];
const FILTER_LABELS = new Map(FILTERS.map((filter) => [filter.id, filter.label]));
const SEARCH_CACHE_VERSION = 'v6';
const SEARCH_CACHE_TTL = 60 * 1000;
const SEARCH_LIVE_REFRESH_INTERVAL = 30 * 1000;

function getInitialSearchQuery() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

function getInitialTaxiStand() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('stand') || '';
}

function getSearchCacheKey(query = '', taxiStand = '') {
  const normalizedQuery = query.trim().toLowerCase() || 'all';
  const normalizedStand = taxiStand.trim().toLowerCase() || 'any-stand';
  return `lobby:driver-search:${SEARCH_CACHE_VERSION}:${normalizedQuery}:${normalizedStand}`;
}

function readCachedDrivers(query = '', taxiStand = '') {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(getSearchCacheKey(query, taxiStand));
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.savedAt || Date.now() - cached.savedAt > SEARCH_CACHE_TTL) return null;
    if (!Array.isArray(cached.drivers)) return null;

    return cached.drivers;
  } catch {
    return null;
  }
}

function writeCachedDrivers(query = '', taxiStand = '', drivers = []) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(
      getSearchCacheKey(query, taxiStand),
      JSON.stringify({ savedAt: Date.now(), drivers })
    );
  } catch {
    // Session storage is a speed hint only.
  }
}

async function requestDrivers(query = '', taxiStand = '', options = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('destination', query.trim());
  if (taxiStand.trim()) params.set('stand', taxiStand.trim());

  const url = `${API_BASE_URL}/driver/search${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { signal: options.signal });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Search failed');
  }

  if (data.success && Array.isArray(data.drivers)) {
    return data.drivers;
  }

  return [];
}

export default function SearchPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery);
  const [selectedTaxiStand, setSelectedTaxiStand] = useState(getInitialTaxiStand);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [toast, setToast] = useState('');
  const [recentContacts, setRecentContacts] = useState([]);
  const [leadFollowUp, setLeadFollowUp] = useState(null);
  const [isSubmittingFollowUp, setSubmittingFollowUp] = useState(false);
  const activeFetchRef = useRef(0);
  const abortRef = useRef(null);
  const riderIdRef = useRef(null);
  const lastTrackedSearchRef = useRef('');
  const riderId = user?.id || null;

  useEffect(() => {
    riderIdRef.current = riderId;
  }, [riderId]);

  const visibleDrivers = useMemo(() => {
    if (activeFilter === 'top_rated') {
      return [...drivers].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    if (activeFilter !== 'all') {
      return drivers.filter((driver) => getDriverVehicleTypeId(driver) === activeFilter);
    }

    return drivers;
  }, [activeFilter, drivers]);
  const activeFilterLabel = FILTER_LABELS.get(activeFilter) || 'Drivers';

  const fetchDrivers = useCallback(async (query = '', taxiStand = '', options = {}) => {
    const cachedDrivers = options.preferCache ? readCachedDrivers(query, taxiStand) : null;
    const fetchId = Date.now();

    activeFetchRef.current = fetchId;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    if (cachedDrivers) {
      setDrivers(cachedDrivers);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const nextDrivers = await requestDrivers(query, taxiStand, { signal: controller.signal });
      if (activeFetchRef.current !== fetchId) return;

      setDrivers(nextDrivers);
      writeCachedDrivers(query, taxiStand, nextDrivers);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("Fetch error:", err);
      if (!cachedDrivers) {
        setError("We could not load drivers right now. Try refreshing, choose another taxi stand, or contact support.");
      }
    } finally {
      if (activeFetchRef.current === fetchId) setLoading(false);
    }
  }, []);

  const trackSearchEvent = useCallback(async (query = '', taxiStand = '', vehicleTypeFilter = 'all') => {
    const normalizedQuery = query.trim();
    const normalizedStand = taxiStand.trim();
    const key = `${normalizedQuery.toLowerCase()}|${normalizedStand.toLowerCase()}|${vehicleTypeFilter}`;

    if (!normalizedQuery && !normalizedStand && vehicleTypeFilter === 'all') return;
    if (lastTrackedSearchRef.current === key) return;

    lastTrackedSearchRef.current = key;

    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'search',
          destination: normalizedQuery,
          taxiStand: normalizedStand,
          vehicleTypeFilter,
          riderId: riderIdRef.current,
        }),
      });
    } catch (err) {
      console.error("Search tracking failed", err);
    }
  }, []);

  // 1. Fetch Drivers on Load
  useEffect(() => {
    let cancelled = false;
    const initialQuery = getInitialSearchQuery();
    const initialTaxiStand = getInitialTaxiStand();
    window.queueMicrotask(() => {
      if (!cancelled) {
        fetchDrivers(initialQuery, initialTaxiStand, { preferCache: true });
        trackSearchEvent(initialQuery, initialTaxiStand);
      }
    });

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [fetchDrivers, trackSearchEvent]);

  // Keep availability fresh without hammering the search API while riders linger.
  useEffect(() => {
    let isRefreshing = false;
    let controller;

    const refreshDriversQuietly = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isRefreshing) return;

      isRefreshing = true;
      controller?.abort();
      controller = new AbortController();

      try {
        const updatedDrivers = await requestDrivers(searchQuery, selectedTaxiStand, {
          signal: controller.signal,
        });

        setDrivers(updatedDrivers);
        writeCachedDrivers(searchQuery, selectedTaxiStand, updatedDrivers);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("Live update failed silently:", err);
      } finally {
        isRefreshing = false;
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshDriversQuietly();
    };

    const intervalId = setInterval(refreshDriversQuietly, SEARCH_LIVE_REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      controller?.abort();
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [searchQuery, selectedTaxiStand]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (selectedTaxiStand) params.set('stand', selectedTaxiStand);

    setActiveFilter('all');
    setSelectedDriver(null);
    setToast(query || selectedTaxiStand ? 'Finding matching drivers...' : 'Showing available drivers.');
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    fetchDrivers(query, selectedTaxiStand, { preferCache: true });
    trackSearchEvent(query, selectedTaxiStand, 'all');
  };

  useEffect(() => {
    let cancelled = false;

    const handleRecentContacts = () => {
      if (!cancelled) setRecentContacts(loadRecentDriverContacts());
    };

    window.queueMicrotask(handleRecentContacts);
    window.addEventListener('storage', handleRecentContacts);
    window.addEventListener('lobby:recent-driver-contacts', handleRecentContacts);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleRecentContacts);
      window.removeEventListener('lobby:recent-driver-contacts', handleRecentContacts);
    };
  }, []);

  const rememberDriverContact = useCallback((driver, method) => {
    const nextContacts = saveRecentDriverContact(driver, method);
    setRecentContacts(nextContacts);
  }, []);

  const trackDriverEvent = useCallback(async (driver, type) => {
    if (!driver?._id) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          driverId: driver._id,
          riderId
        })
      });
      return await res.json();
    } catch (err) {
      console.error("Tracking failed", err);
      return null;
    }
  }, [riderId]);

  const trackCall = async (driver) => {
    rememberDriverContact(driver, 'call');
    setToast(`Calling ${driver.fullName || 'driver'}. Added to Recently Contacted.`);
    const result = await trackDriverEvent(driver, 'call_click');
    if (result?.leadId) {
      setLeadFollowUp({
        leadId: result.leadId,
        type: 'call',
        driverName: driver.fullName || 'Driver',
      });
    }
  };

  const trackWhatsApp = async (driver) => {
    rememberDriverContact(driver, 'whatsapp');
    setToast(`WhatsApp message ready for ${driver.fullName || 'driver'}. Added to Recently Contacted.`);
    const result = await trackDriverEvent(driver, 'whatsapp_click');
    if (result?.leadId) {
      setLeadFollowUp({
        leadId: result.leadId,
        type: 'whatsapp',
        driverName: driver.fullName || 'Driver',
      });
    }
  };

  const submitLeadFollowUp = async (outcome) => {
    if (!leadFollowUp?.leadId || isSubmittingFollowUp) return;
    setSubmittingFollowUp(true);

    try {
      const res = await fetch(`${API_BASE_URL}/analytics/lead-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: leadFollowUp.leadId,
          riderId,
          outcome,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Follow-up failed');

      setToast(outcome === 'completed' ? 'Thanks. Ride completion noted.' : 'Thanks. We noted that no trip happened.');
      setLeadFollowUp(null);
    } catch (error) {
      console.error('Lead follow-up failed', error);
      setToast('Could not save ride follow-up.');
    } finally {
      setSubmittingFollowUp(false);
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
    if (!selectedDriver?._id) return;
    trackDriverEvent(selectedDriver, 'profile_view');
  }, [selectedDriver, trackDriverEvent]);

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
          <form action="/search" onSubmit={handleSearch} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <TaxiStandDropdown
              value={selectedTaxiStand}
              onChange={setSelectedTaxiStand}
              variant="search"
            />

            <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-[#58A6FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#58A6FF]/10">
              <MapPin className="absolute left-4 text-slate-400" size={20} />
              <input
                type="search"
                name="q"
                aria-label="Destination"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Where do you want to go? (e.g. Dawki)"
                className="w-full bg-transparent py-4 pl-12 pr-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 sm:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFC857] px-5 text-sm font-black text-[#1A1205] shadow-lg shadow-[#FFC857]/20 transition hover:bg-[#F59E0B] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              Find Driver
            </button>
          </form>
          {selectedTaxiStand && (
            <p className="mt-2 text-sm font-semibold text-[#2F80ED]">
              Showing drivers who park at {selectedTaxiStand}.
            </p>
          )}
        </div>

        {recentContacts.length > 0 && (
          <RecentlyContactedStrip
            drivers={recentContacts.slice(0, 4)}
            onSelect={(driver) => setSelectedDriver(driver)}
          />
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 sm:mb-8">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeFilter === filter.id
                  ? 'border-[#58A6FF] bg-[#FFEDD5] text-[#2F80ED]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* --- INSTANT BOOK QUICK ACTION --- */}
        <div className="mb-10 rounded-4xl bg-linear-to-br from-[#EAF4FF] to-[#FFEDD5]/30 p-1 sm:p-2 border border-[#CFE4FF]/50 shadow-sm">
          <div className="px-4 pt-6 pb-2 text-center sm:px-6">
            <h2 className="text-xl font-[Sailors_Slant_Normal] text-slate-900 tracking-tight">In a hurry?</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 mb-6">
              Skip the manual search. Let us find the nearest available driver for you.
            </p>
          </div>
          <InstantBook destination={searchQuery || selectedTaxiStand || "Kohima"} taxiStand={selectedTaxiStand} />
        </div>

        {/* Divider before manual results */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Or choose manually</span>
          <div className="h-px bg-slate-200 flex-1"></div>
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
            <p className="mx-auto mt-2 max-w-xs text-sm text-red-500">
              Please refresh, try another taxi stand, or contact support so we can help you find a driver.
            </p>
            <a
              href="/support"
              className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-red-600 ring-1 ring-red-100"
            >
              Contact Support
            </a>
          </div>
        ) : visibleDrivers.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <div className="mb-4 inline-flex rounded-full bg-slate-100 p-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {drivers.length === 0 ? 'No active drivers found' : `No ${activeFilterLabel.toLowerCase()} found`}
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-slate-500">
              {drivers.length === 0
                ? selectedTaxiStand
                  ? `No verified drivers are online at ${selectedTaxiStand} right now. Try another stand or contact support.`
                  : 'Try another taxi stand, change the destination, or contact support.'
                : 'Try another search or switch back to all rides.'}
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
              {selectedTaxiStand && (
                <button
                  type="button"
                  onClick={() => {
                    const query = searchQuery.trim();
                    setSelectedTaxiStand('');
                    setActiveFilter('all');
                    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
                    fetchDrivers(query, '', { preferCache: true });
                    trackSearchEvent(query, '', 'all');
                  }}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black sm:w-auto"
                >
                  Try All Taxi Stands
                </button>
              )}
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black sm:w-auto"
                >
                  Show All Rides
                </button>
              )}
              <a
                href="/support"
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Contact Support
              </a>
            </div>
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
          rider={user}
          destination={searchQuery}
          taxiStand={selectedTaxiStand}
          onClose={() => setSelectedDriver(null)}
          onCall={() => trackCall(selectedDriver)}
          onWhatsApp={() => trackWhatsApp(selectedDriver)}
        />
      )}

      {leadFollowUp && (
        <LeadFollowUpPrompt
          lead={leadFollowUp}
          isSubmitting={isSubmittingFollowUp}
          onSubmit={submitLeadFollowUp}
          onDismiss={() => setLeadFollowUp(null)}
        />
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-28 z-60 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-[#FFEDD5] bg-white px-4 py-3 text-sm font-bold text-[#2F80ED] shadow-xl shadow-slate-900/10 md:bottom-8">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="min-w-0 flex-1">{toast}</span>
          <button type="button" onClick={() => setToast('')} className="rounded-full p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function getDriverRoutes(driver) {
  return driver.routes && driver.routes.length > 0 ? driver.routes : ['Local City Run'];
}

function getDriverTaxiStands(driver = {}) {
  return Array.isArray(driver.taxiStands)
    ? driver.taxiStands
    : Array.isArray(driver.taxi_stands)
      ? driver.taxi_stands
      : [];
}

function getDriverCurrentStand(driver = {}) {
  return String(driver.currentStand || driver.current_stand || '').trim();
}

function getDriverInitial(driver) {
  return driver.fullName?.charAt(0) || 'D';
}

function getDriverVehiclePlate(driver = {}) {
  return String(
    driver.vehiclePlate ||
    driver.vehicle_plate ||
    driver.numberPlate ||
    driver.plateNumber ||
    ''
  ).trim();
}

function getDriverVehicleTypeId(driver = {}) {
  return normalizeVehicleType(driver.vehicleType || driver.vehicle_type || '');
}

function getDriverVehicleType(driver = {}) {
  return vehicleTypeLabel(driver.vehicleType || driver.vehicle_type || '');
}

function isDriverVerified(driver = {}) {
  return driver.isVerified !== false;
}

function formatContactTime(value) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
}

function VerifiedDriverBadge({ compact = false }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-50 font-black text-green-700 ring-1 ring-green-100 ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}>
      <CheckCircle2 size={compact ? 11 : 13} />
      Verified
    </span>
  );
}

function PlateBadge({ plate, compact = false }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 font-black uppercase tracking-wide text-slate-800 ring-1 ring-slate-200 ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}>
      <Hash size={compact ? 10 : 12} />
      <span className="truncate">{plate || 'Plate not added'}</span>
    </span>
  );
}

function RecentlyContactedStrip({ drivers = [], onSelect }) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Recently contacted</p>
          <h2 className="text-base font-black text-slate-950">Quickly reopen a driver</h2>
        </div>
        <Clock size={18} className="text-slate-300" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {drivers.map((driver) => {
          const plate = getDriverVehiclePlate(driver);
          const contactMethod = driver.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Call';

          return (
            <button
              key={driver._id || driver.id || driver.phone}
              type="button"
              onClick={() => onSelect(driver)}
              className="min-w-60 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-[#58A6FF]/30 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <DriverAvatar driver={driver} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-black text-slate-950">{driver.fullName || 'Driver'}</p>
                    {isDriverVerified(driver) && <CheckCircle2 size={13} className="shrink-0 text-green-600" />}
                  </div>
                  <p className="truncate text-xs font-bold text-slate-500">
                    {contactMethod} • {formatContactTime(driver.lastContacted || driver.lastCalled)}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <PlateBadge plate={plate} compact />
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-500 ring-1 ring-slate-200">
                  {driver.vehicle || 'Standard Taxi'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
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
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-900 to-slate-700 text-xl font-bold">
          {getDriverInitial(driver)}
        </div>
      )}
    </div>
  );
}

function DriverResultCard({ driver, onSelect }) {
  const vehicle = driver.vehicle || 'Standard Taxi';
  const vehiclePlate = getDriverVehiclePlate(driver);
  const vehicleType = getDriverVehicleType(driver);
  const routes = getDriverRoutes(driver);
  const taxiStands = getDriverTaxiStands(driver);
  const currentStand = getDriverCurrentStand(driver);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-[#58A6FF]/20 hover:shadow-lg sm:p-5"
    >
      <div className="flex gap-3 sm:gap-4">
        <DriverAvatar driver={driver} size={60} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-slate-900 transition group-hover:text-[#2F80ED]">
                  {driver.fullName || 'Driver'}
                </h3>
                {isDriverVerified(driver) && <VerifiedDriverBadge compact />}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {driver.rating || 5.0}
                </span>
                <span className="truncate">• {vehicle}</span>
                {vehicleType && (
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#EAF4FF] px-2 py-0.5 text-xs font-black text-[#2F80ED]">
                    <Car size={11} />
                    <span className="truncate">{vehicleType}</span>
                  </span>
                )}
                <PlateBadge plate={vehiclePlate} compact />
                {currentStand && (
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-black text-green-700">
                    <MapPin size={11} />
                    <span className="truncate">At {currentStand}</span>
                  </span>
                )}
                {!currentStand && taxiStands[0] && (
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#EAF4FF] px-2 py-0.5 text-xs font-black text-[#2F80ED]">
                    <MapPin size={11} />
                    <span className="truncate">{taxiStands[0]}</span>
                  </span>
                )}
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-bold text-[#2F80ED]">
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

function getWhatsAppHref(driver, destination = '', rider = null, taxiStand = '') {
  const digits = String(driver?.phone || '').replace(/\D/g, '');
  if (!digits) return null;

  const driverName = driver?.fullName || 'there';
  const riderName = rider?.firstName || rider?.fullName || '';
  const vehiclePlate = getDriverVehiclePlate(driver);
  const destinationText = String(destination || '').trim();
  const standText = String(taxiStand || getDriverCurrentStand(driver) || '').trim();
  const message = [
    `Hi ${driverName}, I found you on THE LOBBY.`,
    riderName ? `This is ${riderName}.` : '',
    destinationText
      ? `I am looking for a ride to ${destinationText}.`
      : standText
        ? `I am checking for a ride from ${standText}.`
        : 'Are you available for a ride?',
    vehiclePlate ? `I can see your vehicle plate as ${vehiclePlate}.` : '',
    'Please reply with your availability and fare estimate. Thank you.',
  ].filter(Boolean).join(' ');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function DriverDetailsSheet({ driver, rider, destination = '', taxiStand = '', onClose, onCall, onWhatsApp }) {
  const vehicle = driver.vehicle || 'Standard Taxi';
  const vehiclePlate = getDriverVehiclePlate(driver);
  const vehicleType = getDriverVehicleType(driver);
  const routes = getDriverRoutes(driver);
  const taxiStands = getDriverTaxiStands(driver);
  const currentStand = getDriverCurrentStand(driver);
  const phoneHref = driver.phone ? `tel:${driver.phone}` : undefined;
  const whatsappHref = getWhatsAppHref(driver, destination, rider, taxiStand);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportNotice, setReportNotice] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const submitDriverReport = async (event) => {
    event.preventDefault();

    const message = reportText.trim();
    if (message.length < 10) {
      setReportNotice('Please add a little more detail before submitting.');
      return;
    }

    setIsReporting(true);
    setReportNotice('');

    try {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rider?.fullName || rider?.firstName || 'Rider',
          email: rider?.primaryEmailAddress?.emailAddress || '',
          userId: rider?.id || '',
          role: 'rider',
          topic: `Driver report: ${driver.fullName || 'Driver'}`,
          message,
          reportType: 'driver_report',
          driverId: driver._id,
          driverName: driver.fullName || 'Driver',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Report failed');

      setReportText('');
      setReportNotice('Report submitted. Admin will review this driver.');
      window.setTimeout(() => setIsReportOpen(false), 900);
    } catch (error) {
      setReportNotice(error.message || 'Could not submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center sm:p-4"
    onClick={onClose}
  >
      <div
      onClick={(event) => event.stopPropagation()}
      /* Cleaned up layout utilities to natively mask the y-axis scrollbar tracks */
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-4xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-4xl sm:p-6 scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden"></div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <DriverAvatar driver={driver} size={68} />

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                {driver.fullName || 'Driver'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isDriverVerified(driver) && <VerifiedDriverBadge />}
                <PlateBadge plate={vehiclePlate} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-slate-900">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {driver.rating || 5.0}
                </span>
                <span>•</span>
                <span>{vehicle}</span>
                {vehicleType && (
                  <>
                    <span>•</span>
                    <span>{vehicleType}</span>
                  </>
                )}
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
          <div className="relative mb-5 aspect-16/10 w-full overflow-hidden rounded-3xl bg-slate-100">
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
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2F80ED] shadow-sm">
              <Car size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Vehicle</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{vehicle}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2F80ED] shadow-sm">
              <Car size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Type</p>
            <p className={`mt-1 truncate text-sm font-bold ${vehicleType ? 'text-slate-900' : 'text-slate-400'}`}>
              {vehicleType || 'Not added'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2F80ED] shadow-sm">
              <Phone size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Phone</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{driver.phone || 'Unavailable'}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2F80ED] shadow-sm">
              <Hash size={18} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400">Number plate</p>
            <p className={`mt-1 truncate text-sm font-black uppercase tracking-wide ${vehiclePlate ? 'text-slate-900' : 'text-slate-400'}`}>
              {vehiclePlate || 'Not added'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase text-slate-400">Checked in now</p>
          <div className="mb-5">
            {currentStand ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                <MapPin size={12} />
                {currentStand}
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400">
                No live stand selected
              </span>
            )}
          </div>

          <p className="mb-3 text-xs font-bold uppercase text-slate-400">Daily stands</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {taxiStands.length > 0 ? (
              taxiStands.map((stand) => (
                <span
                  key={stand}
                  className="flex items-center gap-1 rounded-full border border-[#CFE4FF] bg-[#EAF4FF] px-3 py-2 text-xs font-bold text-[#2F80ED]"
                >
                  <MapPin size={12} />
                  {stand}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400">
                No daily stand added
              </span>
            )}
          </div>

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

        <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-3">
          <button
            type="button"
            onClick={() => setIsReportOpen((current) => !current)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-red-500 ring-1 ring-slate-200 transition hover:ring-red-100"
          >
            <Flag size={17} />
            Report Driver
          </button>

          {isReportOpen && (
            <form onSubmit={submitDriverReport} className="mt-3 space-y-3">
              <textarea
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900 outline-none focus:border-red-300"
                placeholder="What happened?"
              />
              {reportNotice && (
                <p className="text-center text-xs font-bold text-slate-500">{reportNotice}</p>
              )}
              <button
                type="submit"
                disabled={isReporting || reportText.trim().length < 10}
                className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          )}
        </div>

        <p className="mb-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-500">
          THE LOBBY only tracks button taps and optional ride confirmations. Calls are never recorded.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsApp}
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-4 py-4 text-sm font-bold text-green-700 ring-1 ring-green-100 transition hover:bg-green-100"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-2xl bg-slate-200 px-4 py-4 text-sm font-bold text-slate-400"
            >
              WhatsApp
            </button>
          )}

          {phoneHref ? (
            <a
              href={phoneHref}
              onClick={onCall}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#58A6FF] px-4 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-[#58A6FF]/20 transition hover:bg-[#2F80ED]"
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

function LeadFollowUpPrompt({ lead, isSubmitting, onSubmit, onDismiss }) {
  return (
    <div className="fixed inset-x-4 bottom-28 z-60 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15 md:bottom-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#2F80ED]">
          {lead.type === 'whatsapp' ? <MessageCircle size={20} /> : <Phone size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Optional follow-up</p>
          <h2 className="mt-1 text-base font-black text-slate-950">Did this become a ride?</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
            Your answer helps THE LOBBY understand completed trips without recording calls.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-slate-100 p-2 text-slate-500"
          aria-label="Dismiss ride follow-up"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSubmit('completed')}
          disabled={isSubmitting}
          className="min-h-11 rounded-2xl bg-[#58A6FF] px-3 text-sm font-black text-slate-950 disabled:opacity-60"
        >
          Ride completed
        </button>
        <button
          type="button"
          onClick={() => onSubmit('not_completed')}
          disabled={isSubmitting}
          className="min-h-11 rounded-2xl bg-slate-100 px-3 text-sm font-black text-slate-700 disabled:opacity-60"
        >
          No trip
        </button>
      </div>
    </div>
  );
}
