"use client";

import { ArrowRight, Heart, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#DCFCE7]/40 via-[#F8FAFC] to-[#BFDBFE]/40 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            We are <span className="text-[#0F766E]">THE LOBBY.</span>
          </h1>

          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Revolutionizing the way riders connect with drivers. No middlemen, no hidden fees—just direct, transparent communication.
          </p>
        </div>
      </div>

      {/* --- OUR MISSION --- */}
      <div className="max-w-5xl mx-auto px-6 py-20 -mt-10">
        <div className="grid md:grid-cols-3 gap-8">
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
      <div className="max-w-4xl mx-auto px-6 py-6 mb-16">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Meet the Creators
          </h2>

          <p className="text-slate-500 font-medium mt-3">
            The minds behind the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <CreatorCard
            name="Nilesh Sen"
            role="Chief Technical Officer"
            image="https://api.dicebear.com/7.x/avataaars/svg?seed=happy"
            bio="The technical bulldozer behind the platform. The force that keeps things moving in THE LOBBY."
            links={{
              github: "https://github.com/Nilpete12",
              linkedin: "https://www.linkedin.com/in/nilesh-sen-a76642284/"
            }}
          />

          <CreatorCard
            name="Khalong Kichu"
            role="Chief Executive Officer"
            image="https://api.dicebear.com/7.x/avataaars/svg?seed=veget"
            bio="The visionary ensuring THE LOBBY delivers the best experience for both riders and drivers across the city."
            links={{
              github: "https://github.com/khalongkichu348-ops",
              linkedin: "https://www.linkedin.com/in/khalong-kichu-89a93b2a0/"
            }}
          />

        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="bg-white border-t border-slate-200 py-20 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
          Have questions or feedback?
        </h2>

        <p className="text-slate-500 font-medium mb-10">
          We&apos;d love to hear from you. Reach out to our support team.
        </p>

        <Link
          href="/support"
          className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#115E59] transition shadow-lg shadow-cyan-100"
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
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-200 relative overflow-hidden group transition duration-300">

      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
        <Icon size={100} />
      </div>

      <div className="w-14 h-14 bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] text-[#0F766E] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Icon size={24} />
      </div>

      <h3 className="font-extrabold tracking-tight text-2xl text-slate-900 mb-3">
        {title}
      </h3>

      <p className="text-slate-500 font-medium leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

function CreatorCard({ name, role, image, bio, links }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col items-center text-center">

      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white mb-5 shadow-sm bg-[#F8FAFC]">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
        {name}
      </h3>

      <p className="text-[#0F766E] font-semibold text-sm mb-5">
        {role}
      </p>

      <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 px-4">
        &ldquo;{bio}&rdquo;
      </p>

      <div className="flex gap-4 mt-auto">
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 text-slate-400 hover:text-[#0F766E] hover:bg-[#DCFCE7] rounded-full transition"
        >
        </a>

        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 text-slate-400 hover:text-[#0F766E] hover:bg-[#DBEAFE] rounded-full transition"
        >
        </a>
      </div>
    </div>
  );
}
