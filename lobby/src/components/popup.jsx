"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Already dismissed
    if (localStorage.getItem("hideInstallPopup") === "true") return;

    // Already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    ) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Small delay before showing
      setTimeout(() => {
        setShowPopup(true);
      }, 2500);
    };

    const handleInstalled = () => {
      setShowPopup(false);
      localStorage.setItem("hideInstallPopup", "true");
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPopup(false);
        localStorage.setItem("hideInstallPopup", "true");
      }

      setDeferredPrompt(null);
      return;
    }

    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent);

    const isSafari =
      /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );

    if (isIOS && isSafari) {
      alert(
        "To install THE LOBBY:\n\nTap the Share button\n\nThen tap 'Add to Home Screen'."
      );
    } else {
      alert(
        "Your browser doesn't currently support one-tap installation.\n\nUse your browser menu and choose 'Install App' or 'Add to Home Screen'."
      );
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem("hideInstallPopup", "true");
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-50 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200 p-5 animate-in slide-in-from-bottom-8 duration-500">

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] shadow-md shrink-0">
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

          <p className="text-sm text-slate-500">
            Faster access, offline support and a smoother experience.
          </p>
        </div>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#0891B2] py-3.5 text-white font-bold shadow-lg shadow-cyan-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
      >
        <Download size={18} />
        Install App
      </button>

      <p className="mt-4 text-center text-xs font-medium text-slate-400">
        Install once • Use anytime
      </p>

    </div>
  );
}
