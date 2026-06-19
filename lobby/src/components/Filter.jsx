export default function FilterBar() {
  const filters = ["All", "Sedan", "SUV", "Hatchback", "Top Rated", "Available Now"];

  return (
    <div className="bg-white border-b border-slate-100 py-3 overflow-x-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-6 flex gap-3">
        {filters.map((filter, i) => (
          <button 
            key={i}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition ${i === 0 ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}