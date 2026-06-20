"use client";
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // This event fires automatically if the browser detects a valid PWA
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Automatically show OUR custom Tailwind popup
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the official native browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // If they installed it, hide our custom popup
    if (outcome === 'accepted') {
      setShowPopup(false);
    }
    
    // We can only use the prompt once, so clear it
    setDeferredPrompt(null);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 z-100 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <button 
        onClick={() => setShowPopup(false)}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-full"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-center gap-4 mb-4 mt-1">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
          {/* Using your PWA icon */}
          <img src="/favicon 512.png" alt="Lobby App" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">Install THE LOBBY</h3>
          <p className="text-slate-400 text-sm mt-0.5">Faster booking, offline access.</p>
        </div>
      </div>
      
      <button 
        onClick={handleInstallClick}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
      >
        <Download size={20} /> Add to Home Screen
      </button>
    </div>
  );
}
