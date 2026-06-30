import { MapPin, Smartphone, ShieldCheck } from 'lucide-react';

export default function Features() {
  const items = [
    {
      icon: <MapPin size={24}/>,
      title: "Destination First",
      desc: "Find drivers who are already planning your route.",
      color: "bg-[#DBEAFE] text-[#0F766E]",
      grad: "bg-gradient-to-r from-[#DBEAFE]/30 to-[#DCFCE7]/20"
    },
    {
      icon: <Smartphone size={24}/>,
      title: "Direct Connection",
      desc: "One tap to call. Connect and Confirm, directly with the driver.",
      color: "bg-[#DCFCE7] text-[#0F766E]",
      grad: "bg-gradient-to-r from-[#DCFCE7]/30 to-[#DBEAFE]/20"
    },
    {
      icon: <ShieldCheck size={24}/>,
      title: "Verified Locals",
      desc: "Travel safely with known faces and community ratings.",
      color: "bg-[#E0F2FE] text-[#0F766E]",
      grad: "bg-gradient-to-r from-[#E0F2FE]/30 to-[#DBEAFE]/20"
    }
  ];

  return (
    <section className="bg-[#F8FAFC] py-16 md:py-28 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-4 md:grid-cols-3 md:gap-12">
        {items.map((item, i) => (
          <div
            key={i}
            className={`bg-white/85 backdrop-blur-sm p-6 md:p-10 rounded-2xl md:rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 ${item.grad}`}
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 md:mb-7 shadow-sm ${item.color}`}
            >
              {item.icon}
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 mb-2.5 md:mb-4">
              {item.title}
            </h3>

            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
