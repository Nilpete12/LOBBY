"use client";

import { useState } from "react";
import Image from "next/image";
import { Power, ShieldCheck, MapPin, Radio, Lock } from "lucide-react";

export default function DriverHero({ userName = "Nilesh", clerkId, initialIsOnline = false, isVerified = false }) {
  // 1. Initialize state with the true MongoDB value
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const [isUpdating, setIsUpdating] = useState(false); // Prevents spam clicking

  const handleToggle = async () => {
    // 2. Prevent toggling if not verified or already updating
    if (!isVerified || isUpdating) return;
    
    setIsUpdating(true);
    const nextState = !isOnline;
    setIsOnline(nextState); // Optimistic UI update for instant feel

    try {
      // 3. Update MongoDB
      const res = await fetch('/api/driver/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clerkId: clerkId, 
          isAvailable: nextState 
        })
      });
      
      const data = await res.json();
      if (!data.success) {
        // If backend fails, revert the toggle
        setIsOnline(!nextState);
        console.error("Failed to update status on server");
      }
    } catch (err) {
      console.error("Network error updating status", err);
      setIsOnline(!nextState);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="relative pt-28 md:pt-36 pb-16 min-h-[75vh] flex items-center justify-center bg-[#edf0ec] overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Background Glow */}
      <div 
        className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] transition-all duration-700 pointer-events-none ${
          isOnline && isVerified ? "bg-[#8ea08e]/25 scale-110" : "bg-white/60 scale-90"
        }`}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* LEFT COLUMN: COMMAND CENTER */}
        <div className="flex-1 w-full max-w-2xl text-center md:text-left">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 border border-white/70 shadow-xs mb-6 transition-all backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              {isOnline && isVerified && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span 
                className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-300 ${
                  !isVerified ? "bg-amber-500" : isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {!isVerified ? "Account Pending Review" : isOnline ? "Broadcasting Location • Active" : "Status • Currently Offline"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
            Ready to drive, <br className="hidden sm:block" />
            <span className={isOnline && isVerified ? "text-[#627568]" : "text-slate-400"}>
              {userName}?
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 font-medium mb-10 max-w-lg mx-auto md:mx-0">
            {!isVerified 
              ? "You must complete your dashboard setup and wait for Admin verification before you can go online."
              : isOnline 
              ? "You are visible to riders across Kohima. Keep your phone sound on for incoming direct requests." 
              : "Toggle your status to online whenever you are ready to start receiving local passenger requests."}
          </p>

          {/* THE MASSIVE ONLINE / OFFLINE TOGGLE CARD */}
          <div className="bg-white/60 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/70 shadow-[0_24px_70px_-34px_rgba(23,29,26,0.36)] max-w-md mx-auto md:mx-0">
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3.5 text-left">
                <div className={`p-3.5 rounded-2xl transition-colors duration-300 ${
                   !isVerified ? "bg-amber-50 text-amber-500" : isOnline ? "bg-[#dce4d8] text-[#627568]" : "bg-[#e8ece6] text-slate-400"
                }`}>
                  {!isVerified ? <Lock size={26} /> : <Radio size={26} className={isOnline ? "animate-pulse" : ""} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {!isVerified ? "Account Locked" : isOnline ? "Accepting Rides" : "Offline Mode"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    {!isVerified ? "Verification required" : isOnline ? "Direct Contact Active" : "No requests incoming"}
                  </p>
                </div>
              </div>

              {/* The Action Switch Button */}
              <button
                onClick={handleToggle}
                disabled={!isVerified || isUpdating}
                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md ${
                  !isVerified
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : isOnline
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 shadow-rose-500/10 active:scale-95 cursor-pointer"
                    : "bg-[#171d1a] hover:bg-[#27302b] text-white shadow-[#171d1a]/20 hover:shadow-lg hover:shadow-[#171d1a]/30 active:scale-95 cursor-pointer"
                }`}
              >
                {!isVerified ? <Lock size={18} /> : <Power size={18} />}
                {!isVerified ? "LOCKED" : isOnline ? "Go Offline" : "GO ONLINE"}
              </button>

            </div>
          </div>

          <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#627568]" /> Zero Commission
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} className="text-[#627568]" /> Kohima Region
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: 3D VISUAL */}
        <div className="hidden md:flex flex-1 justify-end items-center relative">
          <div className="absolute w-72 h-72 bg-[#8ea08e]/10 rounded-full blur-3xl z-0" />
          <div className={`relative w-full max-w-115 h-90 transition-all duration-700 ease-out z-10 ${
            isOnline && isVerified ? "hover:-translate-y-3 drop-shadow-[0_25px_35px_rgba(98,117,104,0.24)]" : "opacity-60 grayscale-40"
          }`}>
            <Image 
              src="/3d-taxi.png" 
              alt="Driver Command Center"
              fill
              className="object-contain"
              priority 
            />
          </div>
        </div>

      </div>
    </section>
  );
}
