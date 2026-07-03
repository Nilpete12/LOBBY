"use client";

import { Wallet, Route, Star, TrendingUp, Clock } from "lucide-react";

export default function DriverStatsSnapshot() {
  // DUMMY DATA: You will eventually fetch this from your MongoDB database
  // via a Server Component or a `useEffect` fetch to an API route.
  const stats = {
    earnings: "₹1,250",
    ridesCompleted: 8,
    rating: 4.9,
    hoursOnline: "4.5h",
    earningsTrend: "+12% from yesterday"
  };

  return (
    <section className="relative pb-16 bg-[#F8FAFC] -mt-8 z-20">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Today&apos;s Overview</h2>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock size={14} /> Auto-updating
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          {/* CARD 1: Earnings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0F766E] group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                <Wallet size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp size={12} />
                {stats.earningsTrend}
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Earnings</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.earnings}
            </h3>
          </div>

          {/* CARD 2: Rides Completed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Route size={24} />
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {stats.hoursOnline} Online
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Rides Completed</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.ridesCompleted}
            </h3>
          </div>

          {/* CARD 3: Rating */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group sm:col-span-2 md:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Star size={24} fill="currentColor" />
              </div>
              <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                Top 10% Driver
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Current Rating</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.rating}
              </h3>
              <span className="text-sm font-bold text-slate-400 mb-1.5">/ 5.0</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
