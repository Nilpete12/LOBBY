"use client";
import { ArrowUpRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, color }) {
  
  // Dynamic color classes based on the 'color' prop
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const activeColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${activeColor}`}>
          <Icon size={24} />
        </div>
        
        {trend && (
          <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${activeColor}`}>
            {trend} <ArrowUpRight size={12} className="ml-1" />
          </span>
        )}
      </div>
      
      <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}