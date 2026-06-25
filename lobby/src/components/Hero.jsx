import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[url('/Hero.webp')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      
      {/* INNER CONTAINER */}
      <div className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto flex flex-col items-center text-center w-full">
        
        {/* Top Badge - Shrunk for mobile */}
        <div className="mb-6 md:mb-8 inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-50/50 border border-emerald-200/90 text-emerald-800 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-600"></span>
          Find Your Next Ride
        </div>

        {/* Headline - text-4xl on mobile, text-7xl on PC */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-slate-900 mb-3 md:mb-4 leading-tight">
          Where are you <br className="hidden md:block" />
          <span className="text-[#0F5A53]">headed today?</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mb-8 md:mb-12 font-medium px-2">
          Local drivers. Fair fares. Direct connections.
        </p>

        {/* Floating Search Container - Tighter padding on mobile */}
        <div className="bg-white/90 backdrop-blur-xl p-3 md:p-6 rounded-3xl md:rounded-4xl shadow-[0_20px_60px_-15px_rgba(15,90,83,0.15)] w-full max-w-3xl border border-white">
          
          {/* Input Row */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            
            {/* INLINE WRAPPER: Keeps the Pin and Input on the SAME row on mobile to save vertical space */}
            <div className="flex w-full items-center gap-2 bg-[#eef5f2] md:bg-transparent rounded-xl md:rounded-none p-1 md:p-0">
              
              {/* Map Pin Icon - Smaller on mobile */}
              <div className="w-10 h-10 md:w-14 md:h-14 bg-white md:bg-[#eef5f2] rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm md:shadow-none">
                <MapPin className="text-[#0F5A53] w-5 h-5 md:w-6 md:h-6" />
              </div>

              {/* Text Input - Slightly shorter on mobile */}
              <input 
                type="text" 
                placeholder="Where to? (e.g. Dawki)" 
                className="w-full h-12 md:h-14 bg-transparent outline-none text-base md:text-lg text-slate-800 placeholder-slate-400 px-2"
              />
            </div>

            {/* Search Button */}
            <button className="w-full md:w-auto h-12 md:h-14 px-8 bg-[#0F5A53] hover:bg-[#0a423d] text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 shrink-0 text-sm md:text-base">
              Search <ArrowRight size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Features Bottom Row - Left aligned and stacked on mobile, center inline on PC */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-2 md:gap-6 mt-4 md:mt-5 pt-3 md:pt-4 border-t border-slate-100 px-2">
            <FeatureItem text="No Commission" />
            <span className="hidden md:block text-slate-200">|</span>
            <FeatureItem text="Local & Verified Drivers" />
            <span className="hidden md:block text-slate-200">|</span>
            <FeatureItem text="100% Direct Contact" />
          </div>

        </div>

      </div>
    </section>
  );
}

// Helper component - Icons and text scale down on mobile
function FeatureItem({ text }) {
  return (
    <span className="flex items-center gap-2 text-[13px] md:text-sm font-semibold text-slate-500">
      <CheckCircle2 className="text-[#7cc29e] w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={2.5} /> 
      {text}
    </span>
  );
}