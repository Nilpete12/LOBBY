"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const DISMISSED_AT_KEY = "installPopupDismissedAt";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}

function isIOSSafari() {
  const userAgent = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(userAgent);

  return isIOS && isSafari;
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY));

  return dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
}

export default function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [installMode, setInstallMode] = useState("native");

  useEffect(() => {
    if (wasRecentlyDismissed() || isStandaloneApp()) return;

    let showTimer;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallMode("native");

      showTimer = window.setTimeout(() => {
        setShowPopup(true);
      }, 1800);
    };

    const handleInstalled = () => {
      setShowPopup(false);
      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    if (isIOSSafari()) {
      setInstallMode("ios");
      showTimer = window.setTimeout(() => {
        setShowPopup(true);
      }, 2500);
    }

    return () => {
      window.clearTimeout(showTimer);

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
      }

      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
      setDeferredPrompt(null);
      return;
    }

    handleClose();
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  };

  if (!showPopup) return null;

  const isIOSMode = installMode === "ios";

  return (
    <div
      role="dialog"
      aria-label="Install THE LOBBY"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-50 rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-300 p-5 animate-in slide-in-from-bottom-8 duration-500"
    >

      <button
        type="button"
        onClick={handleClose}
        aria-label="Close install prompt"
        className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] shadow-md shrink-0">
          <img
            src="/favicon-512.png"
            alt="THE LOBBY"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
            {isIOSMode ? "Add THE LOBBY" : "Install THE LOBBY"}
          </h3>

          <p className="text-sm text-slate-500">
            {isIOSMode
              ? "Save it to your iPhone Home Screen."
              : "Open it faster from your Home Screen."}
          </p>
        </div>
      </div>

      {isIOSMode && (
        <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
          <p><span className="font-bold text-slate-900">1.</span> Tap the Safari Share button.</p>
          <p><span className="font-bold text-slate-900">2.</span> Choose Add to Home Screen.</p>
          <p><span className="font-bold text-slate-900">3.</span> Tap Add.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#0891B2] py-3.5 text-white font-bold shadow-lg shadow-cyan-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
      >
        <Download size={18} />
        {isIOSMode ? "Got it" : "Install App"}
      </button>

      <p className="mt-4 text-center text-xs font-medium text-slate-400">
        Install once • Use anytime
      </p>

    </div>
  );
}
