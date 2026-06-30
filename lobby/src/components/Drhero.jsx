import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function DriverHero() {
  return (
    <section className="mt-20 relative pt-32 pb-20 bg-[#F8FAFC] text-[#0F172A] overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tl from-[#7DD3FC]/40 to-[#BBF7D0]/40 skew-x-14 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#0F766E] text-xs font-semibold uppercase tracking-[0.15em] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            Accepting New Drivers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Your Car. <br/>
            <span className="text-[#0F766E]">Your Business.</span>
          </h1>
          
          <p className="text-xl font-medium text-slate-500 mb-8 leading-relaxed w-1/2">
            Stop paying huge commissions. Join THE LOBBY to connect directly with riders in your city and keep 100% of the fare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="bg-[#0F766E] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#115E59] transition shadow-lg shadow-cyan-100 text-center"
            >
              Become a Driver
            </Link>
          </div>

          <div className="mt-8 flex gap-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#22C55E]" />
              No Joining Fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#22C55E]" />
              Instant Payouts
            </span>
          </div>
        </div>

        {/* Visual Element (Mockup Card) */}

      </div>
    </section>
  );
}
