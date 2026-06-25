"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Don't show again if user dismissed
    if (localStorage.getItem("hideInstallPopup") === "true") return;

    // Show popup after 4 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 4000);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      clearTimeout(timer);

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // Native install prompt available
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPopup(false);
      }

      setDeferredPrompt(null);
    } else {
      // Fallback instructions
      alert(
        "To install THE LOBBY:\n\nChrome → ⋮ menu → Add to Home Screen"
      );
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem("hideInstallPopup", "true");
  };

  if (!showPopup) return null;

  return (
    <div
      className="
      fixed
      bottom-4
      left-4
      right-4
      md:right-8
      md:left-auto
      md:w-[380px]
      z-50
      rounded-3xl
      border border-white/60
      bg-white/80
      backdrop-blur-xl
      shadow-2xl shadow-slate-200
      p-5
      animate-in
      slide-in-from-bottom-8
      duration-500
    "
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="
          absolute top-3 right-3
          p-2 rounded-full
          text-slate-400
          hover:bg-slate-100
          hover:text-slate-700
          transition
        "
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="
          w-14 h-14 rounded-2xl overflow-hidden
          bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE]
          shadow-md shrink-0
        "
        >
          <img
            src="/favicon 512.png"
            alt="THE LOBBY"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
            Install THE LOBBY
          </h3>

          <p className="text-sm text-slate-500 leading-relaxed">
            Faster access, offline support and a smoother experience.
          </p>
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={handleInstallClick}
        className="
          w-full rounded-2xl
          bg-gradient-to-r
          from-[#0F766E]
          to-[#0891B2]
          py-3.5
          text-white
          font-bold
          shadow-lg shadow-cyan-100
          hover:scale-[1.02]
          transition-all
          flex items-center justify-center gap-3
        "
      >
        <Download size={18} />
        Add to Home Screen
      </button>

      <p className="mt-4 text-center text-xs font-medium text-slate-400">
        Install once • Use anytime
      </p>
    </div>
  );
}
