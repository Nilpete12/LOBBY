import { Search, UserCheck, PhoneCall } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search size={32} />,
      title: "1. Search your route",
      desc: "Enter your destination. We show you drivers who drive that specific route."
    },
    {
      icon: <UserCheck size={32} />,
      title: "2. Choose a Driver",
      desc: "Browse profiles, check car photos, and see who is available right now (Green Dot)."
    },
    {
      icon: <PhoneCall size={32} />,
      title: "3. Call Directly",
      desc: "No middleman fees. Call the driver, agree on a pickup point, and start your journey."
    }
  ];

  return (
    <section className="py-16 md:py-28 border-y border-slate-200 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F0FDF4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 md:mb-5">
            How THE LOBBY works
          </h2>

          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            We keep it simple. No hidden algorithms, just direct connections.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-14 relative">

          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#BFDBFE] via-[#BBF7D0] to-[#BFDBFE] -z-10"></div>

          {steps.map((step, i) => (
            <div key={i} className="text-left md:text-center relative p-5 md:pt-4 md:p-0 rounded-2xl bg-white/70 md:bg-transparent border border-slate-200 md:border-0">

              <div className="w-14 h-14 md:w-24 md:h-24 md:mx-auto bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-full flex items-center justify-center shadow-lg md:shadow-xl shadow-cyan-100 border border-slate-200 mb-4 md:mb-8 text-[#0F766E]">
                {step.icon}
              </div>

              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 mb-2 md:mb-4">
                {step.title}
              </h3>

              <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed md:px-6">
                {step.desc}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
