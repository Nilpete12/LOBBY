import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full bg-linear-to-b from-blue-200/70 via-blue-60/30 to-white pt-34 pb-20">
      
      {/* 2. INNER CONTAINER: Centers the text and keeps it neat */}
      <div className="px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live in Kohima.
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Get There. <br className="hidden md:block" />
          <span className="text-slate-500">The Local Way.</span>
        </h1>

        <p className="text-2xl text-slate-600 max-w-2xl mb-8 font-bold font-style: italic leading-relaxed">
          Call. Confirm. Go!
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link href="/search" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black transition flex items-center gap-2 shadow-xl shadow-slate-200">
            Find a Ride <ArrowRight size={18} />
          </Link>
          <Link href="/auth" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition shadow-xl">
            Driver Login
          </Link>
        </div>

      </div>
    </section>
  );
}
