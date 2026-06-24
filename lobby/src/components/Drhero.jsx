import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function DriverHero() {
  return (
    <section className="mt-20 relative pt-32 pb-20 bg-[#FAF9F6] text-[#1E293B] overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tl from-[#A9D6E5]/60 to-[#B7E4C7]/50 skew-x-14 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A9D6E5]/20 border border-[#A9D6E5]/50 text-[#52796F] text-xs font-semibold uppercase tracking-[0.15em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B7E4C7] animate-pulse"></span>
            Accepting New Drivers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            Your Car. <br/>
            <span className="text-[#52796F]">Your Business.</span>
          </h1>
          
          <p className="text-xl font-medium text-slate-500 mb-8 leading-relaxed w-1/2">
            Stop paying huge commissions. Join THE LOBBY to connect directly with riders in your city and keep 100% of the fare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/auth" 
              className="bg-[#52796F] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#84A98C] transition shadow-lg shadow-[#A9D6E5]/20 text-center"
            >
              Become a Driver
            </Link>
          </div>
          
          <div className="mt-8 flex gap-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#84A98C]" />
              No Joining Fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#84A98C]" />
              Instant Payouts
            </span>
          </div>
        </div>

        {/* Visual Element (Mockup Card) */}

      </div>
    </section>
  );
}
