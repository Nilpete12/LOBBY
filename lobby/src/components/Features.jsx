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
    <section className="bg-[#F8FAFC] py-28 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {items.map((item, i) => (
          <div
            key={i}
            className={`bg-white/80 backdrop-blur-sm p-10 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 ${item.grad}`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-7 shadow-sm ${item.color}`}
            >
              {item.icon}
            </div>

            <h3 className="text-2xl font-[Sailors_Slant_Normal] tracking-tight text-slate-900 mb-4">
              {item.title}
            </h3>

            <p className="text-slate-500 font-[Proxima_Nova_Semibold] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
