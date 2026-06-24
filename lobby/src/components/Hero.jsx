import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F8FAFC] pt-40 pb-28">

      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DCFCE7]/40 via-[#F8FAFC] to-[#BFDBFE]/40"></div>

      {/* Blur blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#BBF7D0]/30 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#BFDBFE]/30 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative px-6 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-[#0F766E] text-xs font-semibold uppercase tracking-[0.15em] shadow-sm">

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>

          Live in the Land of the Nagas
        </div>

        {/* Headline */}
        <h1 className="max-w-5xl text-5xl md:text-8xl font-extrabold tracking-tight text-slate-900 leading-[0.95] mb-8">
          Get There.
          <br className="hidden md:block" />
          <span className="text-[#0F766E]">
            The Local Way.
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl text-slate-500 italic font-semibold mb-5">
          Call. Confirm. Go.
        </p>

        <p className="max-w-2xl text-lg text-slate-500 font-medium leading-relaxed mb-12">
          Connecting riders and drivers directly across Nagaland.
          No middlemen, no surge pricing—just local rides, trusted drivers,
          and fair fares.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-5">

          <Link
            href="/search"
            className="bg-[#0F766E] text-white px-9 py-4 rounded-2xl font-semibold text-lg hover:bg-[#115E59] transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-100"
          >
            Find a Ride
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/auth"
            className="bg-white/80 backdrop-blur-sm text-slate-900 border border-slate-200 px-9 py-4 rounded-2xl font-semibold text-lg hover:bg-white transition shadow-lg"
          >
            Driver Login
          </Link>

        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400">

          <span>✓ Local Drivers</span>

          <span>✓ No Commission</span>

          <span>✓ Fair Fares</span>

          <span>✓ Trusted Community</span>

        </div>

      </div>
    </section>
  );
}
