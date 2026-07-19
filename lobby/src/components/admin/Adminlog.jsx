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
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid credentials. Access denied.");
        return;
      }

      const sessionVerified = await onLogin?.();

      if (!sessionVerified) {
        setError("Login succeeded, but the admin session could not be verified. Please try again.");
      }
    } catch {
      setError("Unable to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="lobby-command-gradient min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#181818] text-[#FFC857] mb-6 border border-white/10 shadow-xl">
            <Shield size={32} />
          </div>

          <h1 className="text-3xl font-[Sailors_Slant_Normal] text-white tracking-tight">
            System Access
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Restricted area. Authorized personnel only.
          </p>
        </div>

        <div className="bg-[#181818]/82 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
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
                className="dark-autofill w-full bg-[#121212] border border-white/10 text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#121212_inset] px-4 py-3.5 rounded-xl outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857] transition"
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
                  className="dark-autofill w-full bg-[#121212] border border-white/10 text-white! [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#121212_inset] px-4 py-3.5 rounded-xl outline-none focus:border-[#FFC857] focus:ring-1 focus:ring-[#FFC857] transition font-mono text-sm disabled:opacity-60"
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
              className="w-full bg-[#FFC857] hover:bg-[#F59E0B] text-[#1A1205] font-bold py-4 rounded-xl transition shadow-lg shadow-[#FFC857]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
