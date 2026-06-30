"use client";

import { useState } from "react";
import { MapPin, Car, ArrowRight, Activity } from "lucide-react";

// DUMMY DATA FOR KOHIMA TAXI STANDS
const standsData = [
  {
    id: 1,
    name: "PR Hill Junction",
    location: "Central Kohima, Near Police Headquarters",
    taxis: "25+",
    status: "Busy",
    statusColor: "text-orange-600 bg-orange-100 border-orange-200",
  },
  {
    id: 2,
    name: "BOC Taxi Point",
    location: "South Kohima, Highway Connecting Point",
    taxis: "40+",
    status: "Moderate",
    statusColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
  },
  {
    id: 3,
    name: "High School Junction",
    location: "North Kohima, Near Secretariat Area",
    taxis: "15+",
    status: "Moderate",
    statusColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
  },
  {
    id: 4,
    name: "Razhu Point",
    location: "Main Town Center, Commercial Hub",
    taxis: "20+",
    status: "Busy",
    statusColor: "text-orange-600 bg-orange-100 border-orange-200",
  },
  {
    id: 5,
    name: "Keziekie Stand",
    location: "Near Local Market Area",
    taxis: "10+",
    status: "Quiet",
    statusColor: "text-blue-600 bg-blue-100 border-blue-200",
  },
  {
    id: 6,
    name: "Phoolbari Stand",
    location: "Town Center, Near Old NST",
    taxis: "15+",
    status: "Moderate",
    statusColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
  },
];

export default function TaxiStands() {
  // Controls how many stands are visible initially
  const [visibleCount, setVisibleCount] = useState(3);

  const showMore = () => {
    setVisibleCount(standsData.length);
  };

  const showLess = () => {
    setVisibleCount(3);
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background ambient gradient to blend with the theme */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-white z-0"></div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 md:text-center max-w-2xl md:mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Find Rides from <span className="text-[#0F766E]">Major Stands</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg">
            Skip the waiting. Head to Kohima's most active taxi hubs to find verified local drivers ready to go.
          </p>
        </div>

        {/* Grid of Taxi Stands */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {standsData.slice(0, visibleCount).map((stand) => (
            <div
              key={stand.id}
              className="group bg-white rounded-3xl p-6 border border-[#DBEAFE] shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(15,118,110,0.15)] hover:border-[#0F766E]/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Row: Icon & Status */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                  <MapPin className="text-slate-400 group-hover:text-[#0F766E] transition-colors" size={24} />
                </div>
                
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stand.statusColor} flex items-center gap-1.5`}>
                  <Activity size={12} />
                  {stand.status}
                </span>
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#0F766E] transition-colors">
                {stand.name}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                {stand.location}
              </p>

              {/* Bottom Row: Capacity & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                  <Car size={18} className="text-[#0F766E]" />
                  {stand.taxis} Taxis
                </div>
                
                <button className="text-[#0F766E] p-2 rounded-full hover:bg-teal-50 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View More / View Less Button */}
        <div className="flex justify-center">
          {visibleCount < standsData.length ? (
            <button
              onClick={showMore}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              View All Stands
            </button>
          ) : (
            <button
              onClick={showLess}
              className="bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              Show Less
            </button>
          )}
        </div>

      </div>
    </section>
  );
}