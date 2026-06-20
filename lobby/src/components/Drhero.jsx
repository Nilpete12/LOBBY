import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function DriverHero() {
  return (
    <section className="mt-20 relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-tl from-blue-300/90 to-white skew-x-14 translate-x-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Accepting New Drivers
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            Your Car. <br/>
            <span className="text-blue-500">Your Business.</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 leading-relaxed w-1/2">
            Stop paying huge commissions. Join THE LOBBY to connect directly with riders in in your city and keep 100% of your fare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/auth" 
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/50 text-center"
            >
              Become a Driver
            </Link>
          </div>
          
          <div className="mt-8 flex gap-6 text-sm font-bold text-slate-500">
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> No Joining Fees</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Instant Payouts</span>
          </div>
        </div>

        {/* Visual Element (Mockup Card) */}
       

      </div>
    </section>
  );
}
