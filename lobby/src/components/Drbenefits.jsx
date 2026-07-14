import { Wallet, Clock, Users, Shield } from 'lucide-react';

export default function DriverBenefits() {
  const benefits = [
    {
      icon: <Wallet size={32} />,
      title: "0% Commission",
      desc: "We don't take a cut from your rides. You pay a small monthly subscription, and every rupee you earn is yours."
    },
    {
      icon: <Clock size={32} />,
      title: "Flexible Schedule",
      desc: "No shifts. No penalties. Toggle your status to 'Available' whenever you want to work."
    },
    {
      icon: <Users size={32} />,
      title: "Direct Connection",
      desc: "Riders call you directly. Get paid as per the rates set by the ANTA and NTWTA"
    },
    {
      icon: <Shield size={32} />,
      title: "Community Trust",
      desc: "Build your reputation with our star rating system. Good drivers get more calls automatically."
    }
  ];

  return (
    <section className="py-24 bg-[#FFF7ED]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-[Proxima_Nova_Extrabold] tracking-tight text-slate-900 mb-4">
            Why drive with <span className="font-[Sailors_Slant_Normal] text-[#2F80ED]">THE LOBBY</span>?
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            We are building a directory, not a dispatch service. You are the boss of your own taxi business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white/80 border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 group backdrop-blur-sm"
            >
              <div className="w-14 h-14 bg-linear-to-br from-[#FFEDD5] to-[#DCEBFF] rounded-2xl flex items-center justify-center text-[#2F80ED] shadow-sm mb-6 group-hover:scale-110 transition">
                {item.icon}
              </div>

              <h3 className="text-xl font-[Sailors_Slant_Normal] tracking-tight text-slate-900 mb-3">
                {item.title}
              </h3>

              <p className="text-slate-500 font-[Proxima_Nova_Semibold] leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
