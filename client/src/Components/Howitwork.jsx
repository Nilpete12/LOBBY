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
    <section className="py-24 border-slate-200 border-y bg-linear-to-t from-blue-300/10 to-blue-0">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How LOBBY works</h2>
          <p className="text-slate-500">We keep it simple. No hidden algorithms, just direct connections.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

          {steps.map((step, i) => (
            <div key={i} className="text-center relative pt-4"> {/* bg-slate-50 to hide line behind icon */}
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-[0px_0px_30px] shadow-blue-200 border border-slate-100 mb-6 text-slate-900">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}