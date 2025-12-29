import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchHeader from '../Components/SearchHeader';
import FilterBar from '../Components/Filter';
import RideCard from '../Components/Ridecard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Get the query from URL (e.g. ?q=Shillong)
  const initialQuery = searchParams.get('q') || '';

  // 2. Function to fetch data from Backend
  const fetchDrivers = async (query) => {
    setLoading(true);
    try {
      // If query exists, search. If not, fetch all.
      const url = query 
        ? `http://localhost:5000/api/drivers/search?destination=${query}`
        : `http://localhost:5000/api/drivers/search`; // You might need to add a "get all" endpoint later

      const res = await fetch(url);
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Run fetch when page loads or query changes
  useEffect(() => {
    fetchDrivers(initialQuery);
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20"> {/* pt-20 to clear fixed navbar */}
      
      {/* Search Header (Sticky) */}
      <SearchHeader onSearch={(text) => fetchDrivers(text)} />
      
      {/* Filter Bar */}
      <FilterBar />

      {/* Results Container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Result Count */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {loading ? 'Searching...' : `${drivers.length} Drivers Found`}
          </h2>
          {!loading && initialQuery && <p className="text-slate-500 text-sm">Showing results for "{initialQuery}"</p>}
        </div>

        {/* List Grid */}
        <div className="space-y-4">
          {loading ? (
             // Simple Loading Skeleton
             <div className="animate-pulse space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>)}
             </div>
          ) : (
            drivers.map(driver => (
              <RideCard key={driver.id} driver={driver} />
            ))
          )}

          {!loading && drivers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No drivers found for this route.</p>
              <button onClick={() => fetchDrivers('')} className="text-blue-600 font-bold mt-2 hover:underline">
                View all drivers
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}