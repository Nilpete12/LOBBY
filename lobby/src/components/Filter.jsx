export default function FilterBar() {
  const filters = ["All", "Sedan", "SUV", "Hatchback", "Top Rated", "Available Now"];

  return (
    <div className="bg-[#F8FAFC] border-b border-slate-200 py-4 overflow-x-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-6 flex gap-3">
        {filters.map((filter, i) => (
          <button
            key={i}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-semibold border transition duration-300 ${
              i === 0
                ? "bg-[#0F766E] text-white border-[#0F766E] shadow-lg shadow-cyan-100"
                : "bg-white/80 backdrop-blur-sm text-slate-500 border-slate-200 hover:border-[#BFDBFE] hover:text-[#0F766E] hover:bg-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
