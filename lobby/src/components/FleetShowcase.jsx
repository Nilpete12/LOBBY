"use client";

import Link from 'next/link';
import { Car, Bike, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const FLEET_CATEGORIES = [
  {
    id: 'two_wheeler',
    name: 'Two Wheelers',
    tagline: 'Fastest through traffic',
    desc: 'Ideal for solo riders needing quick local trips across Kohima.',
    icon: Bike,
    badge: 'Quickest',
    border: 'border-[#2a2a2a] hover:border-[#ffc857]/50',
    tagBg: 'bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/20',
  },
  {
    id: 'hatchback',
    name: 'Hatchbacks',
    tagline: 'Economical city rides',
    desc: 'Compact, affordable, and perfect for daily errands and short route hops.',
    icon: Car,
    badge: 'Popular',
    border: 'border-[#2a2a2a] hover:border-[#ffc857]/50',
    tagBg: 'bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/20',
  },
  {
    id: 'sedan',
    name: 'Sedans',
    tagline: 'Comfort & Extra Legroom',
    desc: 'Smooth, comfortable rides suited for business trips and family travel.',
    icon: Car,
    badge: 'Comfort',
    border: 'border-[#2a2a2a] hover:border-[#ffc857]/50',
    tagBg: 'bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/20',
  },
  {
    id: 'suv',
    name: 'SUVs & Cruisers',
    tagline: 'Built for hill terrain',
    desc: 'Spacious, high-clearance vehicles ready for steep inclines and luggage.',
    icon: Car,
    badge: 'Heavy Duty',
    border: 'border-[#2a2a2a] hover:border-[#ffc857]/50',
    tagBg: 'bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/20',
  },
];

export default function FleetShowcase() {
  return (
    <section className="py-24 bg-[#0b0b0b] border-b border-[#2a2a2a] relative overflow-hidden text-[#f5f5f5]">
      {/* Dynamic Background Glow matching global theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#ffc857]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#ffc857] text-xs font-bold uppercase tracking-wider shadow-xs mb-4">
            Ride Your Way
          </div>
          <h2 className="text-4xl sm:text-5xl font-[Proxima_Nova_Extrabold] tracking-tight text-white mb-4">
            Explore <span className="font-[Sailors_Slant_Normal] text-[#ffc857]">Our Fleet</span>
          </h2>
          <p className="text-[#c7c7c7] font-medium text-base sm:text-lg leading-relaxed">
            From quick bike runs to rugged hill-climbing SUVs, pick the exact vehicle type that fits your trip and budget.
          </p>
        </div>

        {/* Grid of Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {FLEET_CATEGORIES.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={`/search?filter=${item.id}`}
                className={`group relative rounded-3xl bg-[#1a1a1a] p-7 border ${item.border} shadow-sm hover:shadow-2xl hover:shadow-[#ffc857]/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              >
                {/* Subtle Hover Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-[#ffc857]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-[#ffc857]/15 text-[#ffc857] border border-[#ffc857]/20 flex items-center justify-center group-hover:bg-[#ffc857] group-hover:text-[#1a1205] transition-colors duration-300 shadow-xs">
                      <IconComponent size={26} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${item.tagBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-[Sailors_Slant_Normal] tracking-tight text-white mb-1 group-hover:text-[#ffc857] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-3">
                    {item.tagline}
                  </p>
                  <p className="text-sm text-[#c7c7c7] font-medium leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Trust Disclaimer */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-[#2a2a2a] p-4 max-w-2xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-[#c7c7c7] shadow-xs">
          <ShieldCheck size={18} className="text-[#ffc857] shrink-0" />
          <span>All vehicle types feature verified drivers and transparent, union-regulated local fares.</span>
        </div>
      </div>
    </section>
  );
}