import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F8FAFC] pt-30 pb-28 md:pt-34">

      {/* Background gradients */}
      <div className="absolute inset-0 bg-linear-to-br from-[#DCFCE7]/20 via-[#F8FAFC]/80 to-[#BFDBFE]/20 md:from-[#DCFCE7]/40 md:via-[#F8FAFC] md:to-[#BFDBFE]/40"></div>
      <div className="pointer-events-none absolute inset-0 bg-[url('/homepage-city.jpg')] bg-cover bg-center opacity-[0.15] mix-blend-multiply saturate-125"></div>

      {/* Blur blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#BBF7D0]/30 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-120 h-120 bg-[#BFDBFE]/30 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative px-6 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-[#0F766E] text-[9px] md:text-xs font-semibold uppercase tracking-[0.12em] md:tracking-[0.15em] shadow-sm">

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20a350] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20a350]"></span>
          </span>

          Live in the capital
        </div>

        {/* Headline */}
        <h1 className="max-w-5xl text-5xl md:text-8xl font-[Proxima_Nova_Semibold] tracking-tight text-slate-900 leading-[0.95] mb-8">
          Get There.
          <span className="block text-[#0F766E] font-[Sailors_Slant_Normal]">
            The Local Way.
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl font-[Proxima_Nova_Semibold] text-slate-500 mb-5">
          Call. Confirm. Go.
        </p>

        {/* Floating Search Container - Tighter padding on mobile */}
        <form action="/search" className="bg-white/90 backdrop-blur-xl p-3 md:p-6 rounded-3xl md:rounded-4xl shadow-[0_20px_60px_-15px_rgba(15,90,83,0.15)] w-full max-w-3xl border border-white">
          
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
                name="q"
                placeholder="Where to?" 
                aria-label="Destination"
                className="w-full h-12 md:h-14 bg-transparent outline-none text-base md:text-lg text-slate-800 placeholder-slate-400 px-2"
              />
            </div>

            {/* Search Button */}
            <button type="submit" className="w-full md:w-auto h-12 md:h-14 px-8 bg-[#0F766E] hover:bg-[#0a423d] text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 shrink-0 text-sm md:text-base">
              Search <ArrowRight size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

        {/* Trust indicators */}
        {/* Features Bottom Row - Left aligned and stacked on mobile, center inline on PC */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-2 md:gap-6 mt-4 md:mt-5 pt-3 md:pt-4 border-t border-slate-100 px-2">
            <FeatureItem text="No Commission" />
            <span className="hidden md:block text-slate-200">|</span>
            <FeatureItem text="Local & Verified Drivers" />
            <span className="hidden md:block text-slate-200">|</span>
            <FeatureItem text="100% Direct Contact" />
          </div>
        </form>

      </div>
    </section>
  );
}

function FeatureItem({ text }) {
  return (
    <span className="flex items-center gap-2 text-[13px] md:text-sm font-semibold text-slate-500">
      <CheckCircle2 className="text-[#0F766E] w-4 h-4 md:w-4.5 md:h-4.5" strokeWidth={2.5} /> 
      {text}
    </span>
  );
}
