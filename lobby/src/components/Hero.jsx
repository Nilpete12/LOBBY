import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-32 md:pt-40 pb-20 md:pb-28">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DCFCE7]/40 via-[#F8FAFC] to-[#BFDBFE]/40"></div>

      {/* Blur blobs */}
      <div className="absolute -left-28 top-10 h-64 w-64 md:h-96 md:w-96 rounded-full bg-[#BBF7D0]/30 blur-3xl"></div>

      <div className="absolute -right-24 top-0 h-72 w-72 md:h-[30rem] md:w-[30rem] rounded-full bg-[#BFDBFE]/30 blur-3xl"></div>

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-sm shadow-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] md:px-5">

          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]"></span>
          </span>

          Find your next ride
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight leading-[1] text-slate-900 sm:text-5xl md:text-7xl lg:text-8xl">

          Get There.
          <br />

          <span className="text-[#0F766E]">
            The Local Way.
          </span>

        </h1>

        {/* Tagline */}
        <p className="mt-6 text-lg sm:text-2xl md:text-3xl font-semibold italic text-slate-500">
          Local Drivers. Fair Fares. Direct Connections.
        </p>

        {/* Description */}
        <p className="mt-5 max-w-2xl text-base md:text-lg font-medium leading-relaxed text-slate-500">
          Connecting riders and drivers directly across Nagaland.
          No middlemen, no surge pricing—just local rides and trusted drivers.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">

          <Link
            href="/search"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-100 transition duration-300 hover:bg-[#115E59]"
          >
            Find a Ride
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/auth"
            className="rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-900 backdrop-blur-sm shadow-lg transition hover:bg-white"
          >
            Driver Login
          </Link>

        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm font-medium text-slate-400 md:mt-16">

          <span>✓ Local Drivers</span>

          <span>✓ No Commission</span>

          <span>✓ Fair Fares</span>

          <span>✓ Trusted Community</span>

        </div>

      </div>
    </section>
  );
}
