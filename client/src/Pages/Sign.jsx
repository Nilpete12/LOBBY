import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, ChevronRight, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

export default function AuthPage() {
  const navigate = useNavigate();
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

        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'driver') navigate('/drive/dashboard');
        else navigate('/account');
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
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Visual Side (Same as before) */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center text-white p-12 z-10">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
        <div className="relative z-20 max-w-lg">
           <h2 className="text-4xl font-bold mb-6">Join the LOBBY.</h2>
           <p className="text-slate-300 text-lg mb-8 leading-relaxed">
             "The most reliable way to travel in the hills. Connect directly with verified local drivers."
           </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-25 relative z-20">
        <div className="w-full max-w-md">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-500">
              {isLogin ? 'Sign in to access your account.' : 'Join as a Rider or Driver.'}
            </p>
          </div>

          <motion.div layout className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            
            {/* Main API Error Banner */}
            {status.mainError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {status.mainError}
              </div>
            )}

            <AnimatePresence mode='wait'>
              
              {/* --- SIGN UP FORM --- */}
              {!isLogin && (
                <motion.form 
                  key="signup"
                  variants={formVariants}
                  initial="hidden" animate="visible" exit="exit"
                  className="space-y-4"
                  onSubmit={handleRegister}
                  noValidate
                >
                  {/* Role Selector */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div onClick={() => setRole('rider')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'rider' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-400'}`}>
                      <User size={24} /><span className="font-bold text-sm">Rider</span>
                    </div>
                    <div onClick={() => setRole('driver')} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'driver' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-400'}`}>
                      <Car size={24} /><span className="font-bold text-sm">Driver</span>
                    </div>
                  </div>

                  {/* Full Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="John Doe" 
                        className={`w-full bg-slate-50 border pl-12 pr-4 py-3 rounded-xl outline-none transition font-medium ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        type="email" 
                        placeholder="name@example.com" 
                        className={`w-full bg-slate-50 border pl-12 pr-4 py-3 rounded-xl outline-none transition font-medium ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        type="password" 
                        placeholder="•••••••• (Min 6 chars)" 
                        className={`w-full bg-slate-50 border pl-12 pr-4 py-3 rounded-xl outline-none transition font-medium ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`} 
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                  </div>

                  <button disabled={status.loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
                    {status.loading ? "Creating..." : (role === 'driver' ? "Join as Driver" : "Create Account")} <ArrowRight size={20} />
                  </button>
                </motion.form>
              )}

              {/* --- LOGIN FORM --- */}
              {isLogin && (
                 <motion.form 
                   key="login"
                   variants={formVariants}
                   initial="hidden" animate="visible" exit="exit"
                   className="space-y-4"
                   onSubmit={handleLogin}
                   noValidate
                 >
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="email" 
                        value={loginData.email} 
                        onChange={handleLoginChange} 
                        type="email" 
                        placeholder="name@example.com" 
                        className={`w-full bg-slate-50 border pl-12 pr-4 py-3 rounded-xl outline-none transition font-medium ${errors.loginEmail ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    {errors.loginEmail && <p className="text-red-500 text-xs mt-1 ml-1">{errors.loginEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="password" 
                        value={loginData.password} 
                        onChange={handleLoginChange} 
                        type="password" 
                        placeholder="••••••••" 
                        className={`w-full bg-slate-50 border pl-12 pr-4 py-3 rounded-xl outline-none transition font-medium ${errors.loginPassword ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    {errors.loginPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.loginPassword}</p>}
                  </div>

                   <button disabled={status.loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
                     {status.loading ? "Signing in..." : "Sign In"} <ArrowRight size={20} />
                   </button>
                 </motion.form>
              )}

            </AnimatePresence>
            
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              {isLogin ? "New to LOBBY?" : "Already have an account?"}
              <button 
                onClick={() => { 
                  setIsLogin(!isLogin); 
                  setStatus({loading:false, mainError:''}); 
                  setErrors({});
                }} 
                className="ml-2 text-blue-600 font-bold hover:underline transition outline-none"
              >
                {isLogin ? "Create an account" : "Sign In instead"}
              </button>
            </div>

          </motion.div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition">
              <ChevronRight size={16} className="rotate-180"/> Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}