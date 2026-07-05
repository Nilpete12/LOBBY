"use client";
import { useEffect, useRef, useState } from 'react';
import API_BASE_URL from '@/config';

const PLATFORM_SETTINGS_CACHE_KEY = 'lobby:platform-settings';
const PLATFORM_SETTINGS_CACHE_TTL = 60 * 1000;

function readCachedSettings() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PLATFORM_SETTINGS_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.savedAt || Date.now() - cached.savedAt > PLATFORM_SETTINGS_CACHE_TTL) return null;

    return cached.settings || null;
  } catch {
    return null;
  }
}

function writeCachedSettings(settings) {
  if (typeof window === 'undefined' || !settings) return;

  try {
    window.sessionStorage.setItem(
      PLATFORM_SETTINGS_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), settings })
    );
  } catch {
    // Cache is just a small responsiveness boost.
  }
}

export default function PlatformGate({ children }) {
  const [settings, setSettings] = useState(readCachedSettings);
  const hasInitialSettingsRef = useRef(Boolean(settings));

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const res = await fetch(`${API_BASE_URL}/platform/settings`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setSettings(data.settings);
          writeCachedSettings(data.settings);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (isMounted && !hasInitialSettingsRef.current) setSettings({ maintenanceMode: false });
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
      controller.abort();
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
