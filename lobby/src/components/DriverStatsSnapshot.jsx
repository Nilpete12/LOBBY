"use client";

import { useEffect, useState } from "react";
import { Eye, MessageCircle, PhoneCall, TrendingUp, Clock } from "lucide-react";
import API_BASE_URL from '@/config';

export default function DriverStatsSnapshot() {
  const [stats, setStats] = useState({
    profileViewsThisMonth: 0,
    callClicksThisMonth: 0,
    whatsappClicksThisMonth: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/driver/history`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success) {
          setStats((current) => ({ ...current, ...data.stats }));
        }
      } catch (error) {
        console.error('Failed to load driver analytics snapshot', error);
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative pb-16 bg-[#FFF7ED] -mt-8 z-20">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Today&apos;s Overview</h2>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock size={14} /> This month
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4FF] flex items-center justify-center text-[#2F80ED] group-hover:bg-[#58A6FF] group-hover:text-slate-950 transition-colors">
                <Eye size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-[Proxima_Nova_Extrabold] text-[#2F80ED] bg-[#EAF4FF] px-2.5 py-1 rounded-full">
                <TrendingUp size={12} />
                Visibility
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Profile Views</p>
            <h3 className="text-3xl font-[Sailors_Slant_Normal] text-slate-900 tracking-tight">
              {stats.profileViewsThisMonth || 0}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4FF] flex items-center justify-center text-[#2F80ED] group-hover:bg-[#58A6FF] group-hover:text-slate-950 transition-colors">
                <PhoneCall size={24} />
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Leads
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Call Clicks</p>
            <h3 className="text-3xl font-[Sailors_Slant_Normal] text-slate-900 tracking-tight">
              {stats.callClicksThisMonth || 0}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group sm:col-span-2 md:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <MessageCircle size={24} />
              </div>
              <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                WhatsApp
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">WhatsApp Clicks</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-[Sailors_Slant_Normal] text-slate-900 tracking-tight">
                {stats.whatsappClicksThisMonth || 0}
              </h3>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
