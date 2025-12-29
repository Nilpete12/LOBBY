import { MapPin, Smartphone, ShieldCheck } from 'lucide-react';

export default function Features() {
  const items = [
    { icon: <MapPin size={24}/>, title: "Destination First", desc: "Find drivers who are already planning your route.", color: "bg-blue-100 text-blue-600", grad: "bg-linear-to-r from-blue-200/20 to-blue-100/10" },
    { icon: <Smartphone size={24}/>, title: "Direct Connection", desc: "One tap to call. Negotiate directly with the driver.", color: "bg-green-100 text-green-600", grad: "bg-linear-to-r from-green-200/20 to-green-100/10" },
    { icon: <ShieldCheck size={24}/>, title: "Verified Locals", desc: "Travel safely with known faces and community ratings.", color: "bg-purple-100 text-purple-600", grad: "bg-linear-to-r from-purple-200/20 to-purple-100/10" }
  ];

  return (
    <section className="bg-slate-50 py-24 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {items.map((item, i) => (
          <div key={i} className={`bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition ${item.grad}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.color}`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}