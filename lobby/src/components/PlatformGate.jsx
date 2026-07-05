"use client";
import { useEffect, useState } from 'react';
import API_BASE_URL from '@/config';

export default function PlatformGate({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch(`${API_BASE_URL}/platform/settings`);
        const data = await res.json();
        if (isMounted && data.success) setSettings(data.settings);
      } catch {
        if (isMounted) setSettings({ maintenanceMode: false });
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (settings?.maintenanceMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">THE LOBBY</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">We will be back shortly</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
            {settings.notice || 'The platform is temporarily under maintenance. Please check again soon.'}
          </p>
        </div>
      </main>
    );
  }

  return children;
}
