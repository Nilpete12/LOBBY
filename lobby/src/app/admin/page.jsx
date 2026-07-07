"use client";
import { useEffect, useState } from 'react';
import AdminLog from '@/components/admin/Adminlog';

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState("checking");
  const [mountCount, setMountCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    // Track how many times this component is being forced to mount
    setMountCount(prev => prev + 1);

    const verifySession = async () => {
      try {
        // Hardcoded path to guarantee it hits your API
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        
        if (isMounted) {
          setAuthStatus(data.authenticated ? "authenticated" : "unauthenticated");
        }
      } catch (error) {
        console.error("Session crash:", error);
        if (isMounted) setAuthStatus("error");
      }
    };

    verifySession();

    return () => { isMounted = false; };
  }, []); // The empty array guarantees this runs exactly ONE time per mount

  // --- RENDER STATES ---
  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-400">
        <p className="font-black text-xl">Checking access...</p>
        <p className="mt-2 text-sm text-red-500">Mount Count: {mountCount}</p>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return <AdminLog onLogin={() => setAuthStatus("authenticated")} />;
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600">Dashboard Loaded!</h1>
      <p>If you see this, the loop is gone.</p>
    </div>
  );
}