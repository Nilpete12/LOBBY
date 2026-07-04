"use client";

import { useState } from "react";
import { Lock, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        setError("Invalid credentials. Access denied.");
        return;
      }

      onLogin?.();
    } catch {
      setError("Unable to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#033b37] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 text-[#0F766E] mb-6 border border-slate-700 shadow-xl">
            <Shield size={32} />
          </div>

          <h1 className="text-3xl font-[Sailors_Slant_Normal] text-white tracking-tight">
            System Access
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Restricted area. Authorized personnel only.
          </p>
        </div>

        <div className="bg-[#032a37]/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1"
              >
                Admin ID
              </label>

              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#031a37] border border-slate-700 text-white px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono text-sm disabled:opacity-60"
                placeholder="admin@lobby.com"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#031a37] border border-slate-700 text-white px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono text-sm disabled:opacity-60"
                  placeholder="••••••••"
                />

                <Lock
                  size={16}
                  className="absolute right-4 top-4 text-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F766E] hover:bg-[#0d625b] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#0F766E]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Authenticate"}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-slate-500 text-sm hover:text-white transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
