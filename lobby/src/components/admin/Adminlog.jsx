"use client";
import { useState } from 'react';
import { Lock, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // --- MOCK AUTHENTICATION LOGIC ---
    // In a real app, this fetches your Node.js backend
    setTimeout(() => {
      if (email === "admin@lobby.com" && password === "admin123") {
        onLogin(); // Tell parent component we are in
      } else {
        setError("Invalid credentials. Access denied.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 text-blue-500 mb-6 border border-slate-700 shadow-xl">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Access</h1>
          <p className="text-slate-400 mt-2 text-sm">Restricted area. Authorized personnel only.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Admin ID</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono text-sm"
                placeholder="admin@lobby.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono text-sm"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute right-4 top-4 text-slate-500" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Authenticate"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/" className="text-slate-500 text-sm hover:text-white transition flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Return to Website
          </Link>
        </div>

      </div>
    </div>
  );
}