import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function DriverHero() {
  return (
    <section className="mt-20 relative pt-32 pb-20 bg-[#0B3D2E] text-white overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tl from-[#D9ED92]/80 to-[#FAFAF9] skew-x-14 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F6F50]/40 border border-[#2D6A4F] text-[#D9ED92] text-xs font-bold uppercase tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E9C46A] animate-pulse"></span>
            Accepting New Drivers
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            Your Car. <br/>
            <span className="text-[#E9C46A]">Your Business.</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed w-1/2">
            Stop paying huge commissions. Join THE LOBBY to connect directly with riders in in your city and keep 100% of the fare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/auth" 
              className="bg-[#E9C46A] text-[#0B3D2E] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#D9ED92] transition shadow-lg shadow-[#0B3D2E]/50 text-center"
            >
              Become a Driver
            </Link>
          </div>
          
          <div className="mt-8 flex gap-6 text-sm font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#D9ED92]" />
              No Joining Fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#D9ED92]" />
              Instant Payouts
            </span>
          </div>
        </div>

        {/* Visual Element (Mockup Card) */}

      </div>
    </section>
  );
}
