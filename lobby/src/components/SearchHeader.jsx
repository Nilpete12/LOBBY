"use client";
import { MapPin, Calendar, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchHeader({ onSearch }) {
  const searchParams = useSearchParams();
  // Initialize with the URL param (e.g., ?q=Shillong) or empty
  const [destination, setDestination] = useState(searchParams.get('q') || '');

  // Update parent when user types or presses enter
  const handleSearch = () => {
    if(onSearch) onSearch(destination);
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-20 z-40 py-4 px-6 shadow-sm">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
        
        {/* Input Field */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where are you heading?" 
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium text-slate-900"
          />
        </div>

        {/* Date Picker (Visual Only for now) */}
        <div className="relative md:w-48">
          <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Today" 
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-black transition font-medium text-slate-900 cursor-pointer"
            readOnly
          />
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <Search size={20} />
          <span className="md:hidden">Search</span>
        </button>

      </div>
    </div>
  );
}