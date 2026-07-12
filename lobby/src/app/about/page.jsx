"use client";

import { ArrowRight, Heart, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#DCFCE7]/40 via-[#F8FAFC] to-[#BFDBFE]/40 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-[Proxima_Nova_Extrabold] tracking-tight text-slate-900 mb-6">
            We are <span className="text-[#0F766E] font-[Sailors_Slant_Normal]">THE LOBBY.</span>
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
          <h2 className="text-5xl font-[Proxima_Nova_Extrabold] tracking-tight text-slate-900">
            Meet the <span className="font-[Sailors_Slant_Normal]">Creators</span>
          </h2>

          <p className="text-slate-500 font-medium mt-3">
            The minds behind the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <CreatorCard
            name="Nilesh Sen"
            role="Chief Technical Officer"
            image="/nilesh-sen.jpeg"
            imagePosition="50% 38%"
            bio="The technical bulldozer behind all the services on the platform. The force that keeps things moving in THE LOBBY."
            links={{
              github: "https://github.com/Nilpete12",
              linkedin: "https://www.linkedin.com/in/nilesh-sen-a76642284/"
            }}
          />

          <CreatorCard
            name="Khalong Kichu"
            role="Chief Executive Officer"
            image="/khalong-kichu.jpg"
            imagePosition="50% 45%"
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
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-4xl shadow-sm hover:shadow-xl border border-slate-200 relative overflow-hidden group transition duration-300">

      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
        <Icon size={100} />
      </div>

      <div className="w-14 h-14 bg-linear-to-br from-[#DCFCE7] to-[#DBEAFE] text-[#0F766E] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
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

function CreatorCard({ name, role, image, imagePosition = "center", bio, links }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col items-center text-center">

      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white mb-5 shadow-sm bg-[#F8FAFC]">
        <div
          role="img"
          aria-label={name}
          className="w-full h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url("${image}")`,
            backgroundPosition: imagePosition
          }}
        />
      </div>

      <h3 className="text-2xl font-[Sailors_Slant_Normal] tracking-tight text-slate-900">
        {name}
      </h3>

      <p className="text-[#0F766E] font-[Proxima_Nova_Semibold] text-sm mb-5">
        {role}
      </p>

      <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 px-4">
        &ldquo;{bio}&rdquo;
      </p>

      <div className="flex gap-4 mt-auto">
        {/* GitHub Link with Inline SVG Icon */}
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 text-slate-400 hover:text-[#0F766E] hover:bg-[#DCFCE7] rounded-full transition-all duration-300 flex items-center justify-center"
          aria-label={`${name}'s GitHub Profile`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>

        {/* LinkedIn Link with Inline SVG Icon */}
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 text-slate-400 hover:text-[#0F766E] hover:bg-[#DBEAFE] rounded-full transition-all duration-300 flex items-center justify-center"
          aria-label={`${name}'s LinkedIn Profile`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
      </div>
    </div>
  );
}