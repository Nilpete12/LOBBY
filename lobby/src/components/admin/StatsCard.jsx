"use client";
import { ArrowUpRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, color }) {
  
  // Dynamic color classes based on the 'color' prop
  const colorClasses = {
    blue: "bg-[#1DB954]/15 text-[#1ED760]",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-[#1DB954]/15 text-[#1ED760]",
    orange: "bg-orange-50 text-orange-600",
  };

  const activeColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#181818]/90 p-4 shadow-sm transition hover:border-[#1DB954]/30 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className={`rounded-2xl p-2.5 sm:p-3 ${activeColor}`}>
          <Icon size={22} />
        </div>
        
        {trend && (
          <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${activeColor}`}>
            {trend} <ArrowUpRight size={12} className="ml-1" />
          </span>
        )}
      </div>
      
      <h3 className="mb-1 text-xs font-black uppercase tracking-wide text-slate-500 sm:text-sm">{title}</h3>
      <p className="text-2xl font-black text-slate-900 sm:text-3xl">{value}</p>
    </div>
  );
}
