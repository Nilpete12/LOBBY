"use client";
import { Search, MapPin, Star, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SearchResultsSkeletons } from '@/components/SkeletonLoader';
import API_BASE_URL from '@/config';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      try {
        const initialDrivers = await requestDrivers();
        if (isMounted) setDrivers(initialDrivers);
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) setError("Could not connect to server. Is it running?");
      }
    }

    loadInitialDrivers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDrivers(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find a Ride</h1>
          <form onSubmit={handleSearch} className="relative flex items-center">
            <MapPin className="absolute left-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Where do you want to go? (e.g. Dawki)" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm outline-none focus:border-blue-500 transition font-medium text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 bg-slate-900 text-white p-2.5 rounded-xl hover:bg-black transition">
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Filters (Visual Only for now) */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All Rides', 'Hatchback', 'SUV', 'Top Rated'].map((filter, i) => (
            <button key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition whitespace-nowrap">
              {filter}
            </button>
          ))}
        </div>

        {/* Results Area */}
        {loading ? (
          <SearchResultsSkeletons count={3} />
        ) : error ? (
          <div className="text-center py-20 bg-red-50 border border-red-200 rounded-2xl">
            <div className="inline-flex bg-red-100 p-4 rounded-full mb-4 text-red-400">
              <Search size={32} />
            </div>
            <p className="text-red-600 font-bold text-lg">{error}</p>
            <p className="text-red-500 text-sm mt-2">Please check your connection and try again.</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No active drivers found</h3>
            <p className="text-slate-500">Try searching for a different location or check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <RideCard key={driver._id || driver.id} driver={driver} currentUser={user} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// --- Helper Component: Ride Card ---
function RideCard({ driver, currentUser }) {
  // Fallback data if driver profile is incomplete
  const vehicle = driver.vehicle || "Standard Taxi";
  const routes = driver.routes && driver.routes.length > 0 ? driver.routes.join(", ") : "Local City Run";

  // 1. New Tracking Function
  const handleCall = async () => {
    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'call_click', driverId: driver._id, 
        riderId: currentUser?.id || null })
      });
    } catch (err) {
      console.error("Tracking failed", err);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
      <div className="flex gap-4">
        
        {/* 1. PROFILE PHOTO (Updated) */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
          {driver.profilePic ? (
            <img src={driver.profilePic} alt={driver.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl">
              {driver.fullName?.charAt(0) || 'D'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                {driver.fullName}
              </h3>
              
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {driver.rating || 5.0}
                </span>
                <span>• {vehicle}</span>
              </div>
            </div>

            {/* Call Button - Sticky on mobile */}
            <a href={`tel:${driver.phone}`} onClick={handleCall} className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg shadow-green-200 transition shrink-0">
              <Phone size={20} />
            </a>
          </div>

          {/* 2. CAR PHOTO (New Section - Only shows if driver uploaded one) */}
          {driver.carPic && (
             <div className="mt-3 mb-3 w-full h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
               <img src={driver.carPic} alt="Car" className="w-full h-full object-cover" />
             </div>
          )}

          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit">
             <MapPin size={12} /> Routes: {routes}
          </div>
        </div>
      </div>
    </div>
  );
}
