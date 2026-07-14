import Link from 'next/link';
import Image from 'next/image'; // 1. Import Next.js Image
import { CheckCircle } from 'lucide-react';

export default function DriverHero() {
  return (
    <section className="relative pt-32 pb-20 h-screen bg-[#FFF7ED] text-[#0F172A] overflow-hidden">
      
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-tl from-[#58A6FF]/40 to-[#58A6FF]/20 skew-x-14 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12 h-full">
        
        {/* TEXT CONTENT */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#2F80ED] text-xs font-semibold uppercase tracking-[0.15em] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            Accepting New Drivers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-[Proxima_Nova_Semibold] tracking-tight mb-6 leading-[1.05]">
            Your Car. <br/>
            <span className="font-[Sailors_Slant_Normal] text-[#2F80ED]">Your Business.</span>
          </h1>
          
          <p className="text-lg font-[Proxima_Nova_Semibold] text-slate-500 mb-8 leading-relaxed md:w-4/5">
            Stop paying huge commissions. Join <span className="font-[Sailors_Slant_Normal]">THE LOBBY</span> to connect directly with riders in your city and keep 100% of the fare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="bg-[#58A6FF] text-slate-950 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#2F80ED] transition shadow-lg shadow-[#58A6FF]/20 text-center"
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

        {/* VISUAL ELEMENT (3D Taxi) */}
        {/* 'hidden md:flex' ensures it disappears completely on mobile phones to save space! */}
        <div className="hidden md:flex flex-1 justify-end relative">
          
          {/* Decorative Glow behind the car to make it pop against the abstract background */}
          <div className="absolute w-80 h-80 bg-white/40 rounded-full blur-3xl z-0"></div>
          
          {/* The Image Wrapper - Adds a smooth hover float effect */}
          <div className="relative w-full max-w-125 h-100 hover:-translate-y-4 transition-transform duration-700 ease-out z-10">
            <Image 
              src="/3d-taxi.png" 
              alt="3D Taxi Illustration"
              fill
              // drop-shadow makes the PNG shadow mold to the shape of the car, unlike a box-shadow!
              className="object-contain drop-shadow-[0_25px_35px_rgba(88,166,255,0.28)]"
              priority 
            />
          </div>
          
        </div>

      </div>
    </section>
  );
}