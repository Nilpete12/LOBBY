"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, ChevronRight, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';
import API_BASE_URL from '@/config';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('rider'); 
  const { login } = useAuth();

  // --- STATE ---
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // New: Specific error state for individual fields
  const [errors, setErrors] = useState({}); 
  const [status, setStatus] = useState({ loading: false, mainError: '' });

  // --- VALIDATION LOGIC ---
  const validateRegister = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Full Name Check
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // 2. Email Check
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // 3. Password Check
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    // Return true if no errors exist
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.loginEmail = "Email is required";
    if (!loginData.password) newErrors.loginPassword = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error as user types
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const fieldName = e.target.name === 'email' ? 'loginEmail' : 'loginPassword';
    if (errors[fieldName]) setErrors({ ...errors, [fieldName]: '' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, mainError: '' });

    // STOP if validation fails
    if (!validateRegister()) return;

    setStatus({ loading: true, mainError: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();

      if (data.success) {
        alert("Account Created Successfully! Please Sign In.");
        setIsLogin(true);
        setFormData({ fullName: '', email: '', password: '' });
        setErrors({});
      } else {
        setStatus({ loading: false, mainError: data.message });
      }
    } catch (err) {
      setStatus({ loading: false, mainError: "Server connection failed." });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, mainError: '' });

    if (!validateLogin()) return;

    setStatus({ loading: true, mainError: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);

        if (data.user.role === 'admin') router.push('/admin');
        else if (data.user.role === 'driver') router.push('/drive/dashboard');
        else router.push('/account');
      } else {
        setStatus({ loading: false, mainError: data.message });
      }
    } catch (err) {
      setStatus({ loading: false, mainError: "Server connection failed." });
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Animation Settings
  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
  <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-x-hidden">

    {/* LEFT VISUAL (Desktop only) */}
    <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center text-white p-12">
      <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
      <div className="relative z-20 max-w-lg">
        <h2 className="text-4xl font-bold mb-6">Join THE LOBBY.</h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          "The most reliable way to travel in the hills. Connect directly with verified local drivers."
        </p>
      </div>
    </div>

    {/* RIGHT FORM SIDE */}
    <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-24 sm:px-6 md:px-10">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500">
            {isLogin ? 'Sign in to access your account.' : 'Join as a Rider or Driver.'}
          </p>
        </div>

        {/* CARD */}
        <motion.div layout className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">

          {/* MAIN API ERROR */}
          {status.mainError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {status.mainError}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* SIGN UP */}
            {!isLogin && (
              <motion.form
                key="signup"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
                onSubmit={handleRegister}
                noValidate
              >

                {/* ROLE SELECTOR */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    onClick={() => setRole('rider')}
                    className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-1 transition
                      ${role === 'rider'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-400 hover:border-slate-400'
                      }`}
                  >
                    <User size={22} />
                    <span className="text-xs font-bold">Rider</span>
                  </div>

                  <div
                    onClick={() => setRole('driver')}
                    className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-1 transition
                      ${role === 'driver'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-400 hover:border-slate-400'
                      }`}
                  >
                    <Car size={22} />
                    <span className="text-xs font-bold">Driver</span>
                  </div>
                </div>

                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      type="text"
                      placeholder="John Doe"
                      className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium
                        ${errors.fullName ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium
                        ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium
                        ${errors.password ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <button
                  disabled={status.loading}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status.loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
                </button>
              </motion.form>
            )}

            {/* LOGIN */}
            {isLogin && (
              <motion.form
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
                onSubmit={handleLogin}
                noValidate
              >

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      type="email"
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  disabled={status.loading}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status.loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* TOGGLE */}
          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? 'New to LOBBY?' : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setStatus({ loading: false, mainError: '' });
              }}
              className="ml-1 text-blue-600 font-bold"
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </button>
          </div>

        </motion.div>

        {/* BACK LINK */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 flex justify-center gap-1">
            <ChevronRight size={16} className="rotate-180" /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  </div>
  );
}