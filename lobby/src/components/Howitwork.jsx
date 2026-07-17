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
    <section className="py-28 border-y border-slate-200 bg-linear-to-b from-[#FFF7ED] via-white to-[#FFF1E7]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-[Proxima_Nova_Extrabold] tracking-tight text-slate-900 mb-5">
            How <span className="font-[Sailors_Slant_Normal] text-[#2F80ED]">THE LOBBY</span> works
          </h2>

          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            We keep it simple. No hidden algorithms, just direct connections.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-14 relative">

          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-[#DCEBFF] via-[#FFEDD5] to-[#DCEBFF] -z-10"></div>

          {steps.map((step, i) => (
            <div key={i} className="text-center relative pt-4">

              <div className="w-24 h-24 mx-auto bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl shadow-[#FFC857] border border-slate-200 mb-8 text-[#2F80ED]">
                {step.icon}
              </div>

              <h3 className="text-2xl font-[Proxima_Nova_Extrabold] tracking-tight text-slate-900 mb-4">
                {step.title}
              </h3>

              <p className="text-slate-500 font-[Proxima_Nova_Semibold] leading-relaxed px-6">
                {step.desc}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
