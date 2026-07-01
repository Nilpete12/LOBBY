"use client";
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchSection() {
  const [destination, setDestination] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (destination) {
      router.push(`/search?q=${destination}`);
    }
  };

  return (
    <section className="px-6 pb-20">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-3 rounded-4xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-3">

        <div className="flex-1 flex items-center px-5 bg-[#F8FAFC] rounded-2xl focus-within:ring-2 focus-within:ring-[#0F766E]/20 transition">
          <MapPin className="text-[#0F766E] mr-3" size={22} />

          <input
            type="text"
            placeholder="Where do you want to go? (e.g. Kohima, Mokokchung)"
            className="bg-transparent w-full py-5 outline-none text-lg font-medium text-slate-900 placeholder-slate-400"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#0F766E] hover:bg-[#115E59] text-white px-10 py-5 md:py-0 rounded-2xl font-semibold text-lg transition duration-300 shadow-lg shadow-cyan-100"
        >
          Search
        </button>

      </div>
    </section>
  );
}
