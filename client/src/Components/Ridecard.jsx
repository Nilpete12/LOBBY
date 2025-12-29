import { Star, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function RideCard({ driver }) {
  return (
    <div className="bg-linear-to-tr from-blue-200/30 to-blue-0 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Driver Info */}
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-slate-200  overflow-hidden shrink-0">
             {/* Placeholder Image */}
             <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl">
               {driver.name.charAt(0)}
             </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{driver.name}</h3>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {driver.rating}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-2">{driver.vehicle} • {driver.seats} Seats</p>
            
            {/* Route Tags */}
            <div className="flex flex-wrap gap-2">
              {driver.routes.map((route, i) => (
                <span key={i} className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
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
               <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Available
               </span>
             ) : (
               <span className="text-xs font-bold text-slate-400">Busy</span>
             )}
          </div>
          
          <a 
            href={`tel:${driver.phone}`}
            className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200"
          >
            <Phone size={18} /> Call Now
          </a>
        </div>

      </div>
    </div>
  );
}