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
  const [error, setError] = useState('');

  // If the user already has a role, kick them out of this page
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      router.replace('/');
    } else if (isLoaded && !user) {
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleContinue = async () => {
    if (!role) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Something went wrong. Please try again.');
      }

      // Force Clerk to refresh its local data so the Navbar instantly knows the role.
      await user?.reload().catch((reloadError) => {
        console.warn('Clerk user reload failed after onboarding:', reloadError);
      });

      // Route to the correct dashboard.
      if (role === 'driver') router.replace('/drive/dashboard');
      else router.replace('/account');
    } catch (error) {
      console.error(error);
      setError(error.message || 'Something went wrong. Please try again.');
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

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

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
