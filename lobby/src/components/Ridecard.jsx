import { Star, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function RideCard({ driver }) {
  return (
    <div className="bg-gradient-to-tr from-[#0B3D2E]/15 to-[#E9C46A]/10 rounded-2xl p-6 border border-[#1F6F50]/20 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Driver Info */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-[#D9ED92]/20 overflow-hidden shrink-0">
             {/* Placeholder Image */}
             <div className="w-full h-full bg-[#D9ED92]/20 flex items-center justify-center text-[#0B3D2E] font-bold text-xl">
               {driver.name.charAt(0)}
             </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{driver.name}</h3>
              <span className="bg-[#D9ED92]/40 text-[#0B3D2E] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {driver.rating}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-2">{driver.vehicle} • {driver.seats} Seats</p>
            
            {/* Route Tags */}
            <div className="flex flex-wrap gap-2">
              {driver.routes.map((route, i) => (
                <span key={i} className="text-xs font-medium text-[#1F6F50] bg-[#D9ED92]/10 border border-[#1F6F50]/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <MapPin size={10} /> {route}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-end justify-center gap-3 min-w-35">
          <div className="text-right">
             {driver.isAvailable ? (
               <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F6F50] bg-[#D9ED92]/20 px-2 py-1 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span> Available
               </span>
             ) : (
               <span className="text-xs font-bold text-slate-400">Busy</span>
             )}
          </div>
          
          <a 
            href={`tel:${driver.phone}`}
            className="w-full bg-[#0B3D2E] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#1F6F50] transition flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200"
          >
            <Phone size={18} /> Call Now
          </a>
        </div>

      </div>
    </div>
  );
}
