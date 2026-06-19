"use client";
import { useRouter } from 'next/navigation';
import { Map, ArrowLeft, Home } from 'lucide-react';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-50/50 to-white px-6">
      <div className="text-center max-w-lg mx-auto">
        
        {/* Visual Icon with Blur Effect */}
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-50 rounded-full"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-blue-50">
            <Map size={64} className="text-blue-600" strokeWidth={1.5} />
            {/* Small 'question mark' badge */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-4 border-white">
              ?
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-black text-slate-900 tracking-tighter mb-2 opacity-10">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4  relative z-10">
          Lost in the hills?
        </h2>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          The destination you are looking for doesn't exist or has been moved. Even the best local drivers can't find this page.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition shadow-xl"
          >
            <ArrowLeft size={18} /> Go Back
          </button>

          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition shadow-xl shadow-slate-200"
          >
            <Home size={18} /> Back Home
          </Link>
        </div>

      </div>
    </div>
  );
}