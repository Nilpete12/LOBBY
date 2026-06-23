"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { User, Car, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // If the user already has a role, kick them out of this page
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const handleContinue = async () => {
    if (!role) return;
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      const data = await res.json();
      if (data.success) {
        // Force Clerk to refresh its local data so the Navbar instantly knows the role
        await user.reload(); 
        
        // Route to the correct dashboard
        if (role === 'driver') router.push('/drive/dashboard');
        else router.push('/account');
      } else {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to LOBBY!</h1>
        <p className="text-slate-500 mb-8">How are you planning to use the platform?</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Rider Option */}
          <div
            onClick={() => setRole('rider')}
            className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all
              ${role === 'rider'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
          >
            <User size={32} />
            <span className="font-bold">Rider</span>
          </div>

          {/* Driver Option */}
          <div
            onClick={() => setRole('driver')}
            className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all
              ${role === 'driver'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
          >
            <Car size={32} />
            <span className="font-bold">Driver</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!role || loading}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Setup'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}