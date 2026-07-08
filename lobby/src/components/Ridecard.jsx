import { Star, Phone, MapPin, Hash } from 'lucide-react';

export default function RideCard({ driver }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Driver Info */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] overflow-hidden shrink-0 shadow-sm">
            {/* Placeholder Image */}
            <div className="w-full h-full flex items-center justify-center text-[#0F766E] font-bold text-xl">
              {driver.name.charAt(0)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {driver.name}
              </h3>

              <span className="bg-[#DCFCE7] text-[#0F766E] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                {driver.rating}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              <span>{driver.vehicle} • {driver.seats} Seats</span>
              {driver.vehiclePlate && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-slate-700">
                  <Hash size={11} />
                  <span className="truncate">{driver.vehiclePlate}</span>
                </span>
              )}
            </div>

            {/* Route Tags */}
            <div className="flex flex-wrap gap-2">
              {driver.routes.map((route, i) => (
                <span
                  key={i}
                  className="text-xs font-medium text-[#0F766E] bg-[#F8FAFC] border border-slate-200 px-3 py-1 rounded-xl flex items-center gap-1"
                >
                  <MapPin size={10} />
                  {route}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-end justify-center gap-4 min-w-35">
          <div className="text-right">
            {driver.isAvailable ? (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F766E] bg-[#DCFCE7] px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Available
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                Busy
              </span>
            )}
          </div>

          <a
            href={`tel:${driver.phone}`}
            className="w-full bg-[#0F766E] text-white font-semibold py-3 px-7 rounded-2xl hover:bg-[#115E59] transition duration-300 flex items-center justify-center gap-2 group-hover:scale-105 shadow-lg shadow-cyan-100"
          >
            <Phone size={18} />
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
}
