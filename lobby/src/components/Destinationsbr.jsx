import { ArrowRight } from 'lucide-react';

export default function Destinations() {
  const routes = [
    { 
      name: "Guwahati Airport", 
      price: "₹2,500 approx", 
      image: "https://parametric-architecture.com/wp-content/uploads/2025/08/International-Architectural-Award-2025-Guwahati-Airport-05.webp", // Placeholder
      tag: "Most Frequent"
    },
    { 
      name: "Dawki / Shnongpdeng", 
      price: "₹3,500 approx", 
      image: "https://assamholidays.com/wp-content/uploads/2023/06/Umgnot-River-Dawki-1.jpg", 
      tag: "Tourist Favorite"
    },
    { 
      name: "Cherrapunji (Sohra)", 
      price: "₹3,000 approx", 
      image: "https://cherrapunjee.com/wp-content/uploads/2019/09/Deep_Valleys_Sohra.jpg", 
      tag: "Scenic Route"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Popular Routes</h2>
            <p className="text-sm md:text-base text-slate-500">Fixed price estimates from verified local drivers.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-slate-900 font-bold hover:gap-3 transition-all">
            View all routes <ArrowRight size={18}/>
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
          {routes.map((route, index) => (
            <div key={index} className="group cursor-pointer min-w-[82%] sm:min-w-[46%] md:min-w-0">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4 bg-slate-100">
                <img 
                  src={route.image} 
                  alt={route.name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-900">
                  {route.tag}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900">{route.name}</h3>
              <p className="text-slate-500 text-sm mt-1">Starts at {route.price}</p>
            </div>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <button className="md:hidden mt-5 w-full py-4 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white">
          View all routes
        </button>
      </div>
    </section>
  );
}
