import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchSection() {
  const [destination, setDestination] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if(destination) {
      // Navigate to the full search page with the query
      navigate(`/search?q=${destination}`);
    }
  };

  return (
    <section className="px-6 pb-16">
      <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl focus-within:ring-1 ring-blue-500 transition">
          <MapPin className="text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Where do you want to go? (e.g. Dawki)"
            className="bg-transparent w-full py-4 outline-none text-lg font-medium text-slate-900 placeholder-slate-400"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button 
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 md:py-0 rounded-xl font-bold text-lg transition"
        >
          Search
        </button>
      </div>
    </section>
  );
}