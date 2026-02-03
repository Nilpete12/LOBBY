import { ArrowRight, Github, Linkedin, Mail, Heart, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white pt-30 pb-15 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            We are <span className="text-blue-500">THE LOBBY.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing the way riders connect with drivers. No middlemen, no hidden fees—just direct, transparent communication.
          </p>
        </div>
      </div>

      {/* --- OUR MISSION --- */}
      <div className="max-w-5xl mx-auto px-6 py-20 -mt-10">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Globe} 
            title="Direct Connection" 
            desc="We remove the barriers between you and your driver. Call directly, negotiate freely." 
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Trusted Community" 
            desc="Every driver is verified with vehicle documentation to ensure a safe journey." 
          />
          <FeatureCard 
            icon={Heart} 
            title="Built for People" 
            desc="We believe in fair earnings for drivers and fair prices for riders." 
          />
        </div>
      </div>

      {/* --- MEET THE CREATORS --- */}
      <div className="max-w-4xl mx-auto px-6 py-6 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Meet the Creators</h2>
          <p className="text-slate-500 mt-2">The minds behind the platform.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* CREATOR 1 */}
          <CreatorCard 
            name="Nilesh Sen" 
            role="Lead Developer & Architect"
            image="https://api.dicebear.com/7.x/avataaars/svg?seed=happy"
            bio="Full-stack developer passionate about building scalable web applications and solving real-world problems through code."
            links={{ github: "https://github.com/Nilpete12", linkedin: "https://www.linkedin.com/in/nilesh-sen-a76642284/"}}
          />

          {/* CREATOR 2 */}
          <CreatorCard 
            name="Khalong Kichu" 
            role="Product & Operations"
            image="https://api.dicebear.com/7.x/avataaars/svg?seed=veget"
            bio="The visionary ensuring LOBBY delivers the best experience for both riders and drivers across the city."
            links={{ github: "https://github.com/khalongkichu348-ops", linkedin: "https://www.linkedin.com/in/khalong-kichu-89a93b2a0/" }}
          />

        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="bg-white border-t border-slate-200 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Have questions or feedback?</h2>
        <p className="text-slate-500 mb-8">We'd love to hear from you. Reach out to our support team.</p>
        <Link 
          to="/support" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl"
        >
          Contact Support <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
        <Icon size={100} />
      </div>
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-xl text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function CreatorCard({ name, role, image, bio, links }) {
  return (
    <div className="bg-linear-to-br from-blue-100 to-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 mb-4 shadow-inner bg-slate-100">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{name}</h3>
      <p className="text-blue-600 font-medium text-sm mb-4">{role}</p>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 px-4">
        "{bio}"
      </p>
      
      <div className="flex gap-4 mt-auto">
        <a href={links.github} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition"><Github size={20} /></a>
        <a href={links.linkedin} className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition"><Linkedin size={20} /></a>
      </div>
    </div>
  );
}