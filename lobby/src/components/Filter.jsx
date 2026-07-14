export default function FilterBar() {
  const filters = ["All", "Sedan", "SUV", "Hatchback", "Top Rated", "Available Now"];

  return (
    <div className="bg-[#FFF7ED] border-b border-slate-200 py-4 overflow-x-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-6 flex gap-3">
        {filters.map((filter, i) => (
          <button
            key={i}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-semibold border transition duration-300 ${
              i === 0
                ? "bg-[#58A6FF] text-slate-950 border-[#58A6FF] shadow-lg shadow-[#58A6FF]/20"
                : "bg-white/80 backdrop-blur-sm text-slate-500 border-slate-200 hover:border-[#DCEBFF] hover:text-[#2F80ED] hover:bg-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
