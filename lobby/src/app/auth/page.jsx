"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, ChevronRight, Car, AlertCircle, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';
import API_BASE_URL from '@/config';

// --- CONSTANTS ---
const ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

const ROLE_ROUTES = {
  admin: '/admin',
  driver: '/drive/dashboard',
  rider: '/account'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- VALIDATION UTILITIES ---
const validatePasswordStrength = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
};

const isPasswordStrong = (password) => {
  const strength = validatePasswordStrength(password);
  return Object.values(strength).every(v => v);
};

const getPasswordStrengthScore = (password) => {
  const strength = validatePasswordStrength(password);
  return Object.values(strength).filter(v => v).length;
};

// --- ERROR MESSAGES ---
const ERROR_MESSAGES = {
  FULLNAME_REQUIRED: "Full Name is required",
  FULLNAME_MIN: "Name must be at least 2 characters",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid email address",
  EMAIL_EXISTS: "Email is already registered. Please sign in.",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN: "Password must be at least 8 characters long",
  PASSWORD_WEAK: "Password is too weak. Use uppercase, lowercase, number, and symbol.",
  LOGIN_FAILED: "Invalid email or password",
  SERVER_ERROR: "Server connection failed. Please try again.",
  NETWORK_ERROR: "Network error. Check your connection and try again."
};

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(ROLES.RIDER);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const { login } = useAuth();

  // --- STATE ---
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [signupStatus, setSignupStatus] = useState({ loading: false, mainError: '' });
  const [loginStatus, setLoginStatus] = useState({ loading: false, mainError: '' });

  // --- VALIDATION LOGIC ---
  const validateRegister = () => {
    const newErrors = {};

    // 1. Full Name Check
    if (!formData.fullName.trim()) {
      newErrors.fullName = ERROR_MESSAGES.FULLNAME_REQUIRED;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = ERROR_MESSAGES.FULLNAME_MIN;
    }

    // 2. Email Check
    if (!formData.email.trim()) {
      newErrors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.EMAIL_INVALID;
    }

    // 3. Password Check
    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (formData.password.length < 8) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_MIN;
    } else if (!isPasswordStrong(formData.password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_WEAK;
    }

    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    if (!loginData.password) newErrors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (signupErrors[e.target.name]) {
      setSignupErrors({ ...signupErrors, [e.target.name]: '' });
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (loginErrors[e.target.name]) {
      setLoginErrors({ ...loginErrors, [e.target.name]: '' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSignupStatus({ loading: false, mainError: '' });

    if (!validateRegister()) return;

    setSignupStatus({ loading: true, mainError: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        alert("Account Created Successfully! Please Sign In.");
        setIsLogin(true);
        setFormData({ fullName: '', email: '', password: '' });
        setSignupErrors({});
      } else {
        const errorMsg = data.message || ERROR_MESSAGES.SERVER_ERROR;
        if (errorMsg.toLowerCase().includes('email')) {
          setSignupStatus({ loading: false, mainError: ERROR_MESSAGES.EMAIL_EXISTS });
        } else {
          setSignupStatus({ loading: false, mainError: errorMsg });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setSignupStatus({
        loading: false,
        mainError: err instanceof TypeError ? ERROR_MESSAGES.NETWORK_ERROR : ERROR_MESSAGES.SERVER_ERROR
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus({ loading: false, mainError: '' });

    if (!validateLogin()) return;

    setLoginStatus({ loading: true, mainError: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);
        const redirectPath = ROLE_ROUTES[data.user.role] || '/account';
        router.push(redirectPath);
      } else {
        setLoginStatus({ loading: false, mainError: ERROR_MESSAGES.LOGIN_FAILED });
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginStatus({
        loading: false,
        mainError: err instanceof TypeError ? ERROR_MESSAGES.NETWORK_ERROR : ERROR_MESSAGES.SERVER_ERROR
      });
    } finally {
      setLoginStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // --- PASSWORD STRENGTH INDICATOR ---
  const passwordStrength = getPasswordStrengthScore(formData.password);
  const showPasswordStrength = formData.password.length > 0 && !isLogin;

  const PasswordStrengthIndicator = () => {
    const requirements = validatePasswordStrength(formData.password);
    const color = passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 4 ? 'text-yellow-500' : 'text-green-500';

    return (
      <div className="mt-2 space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength ? color : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="text-xs space-y-1">
          {Object.entries(requirements).map(([key, met]) => (
            <div key={key} className="flex items-center gap-2">
              {met ? <CheckCircle2 size={12} className="text-green-500" /> : <Circle size={12} className="text-slate-300" />}
              <span className={met ? 'text-green-600' : 'text-slate-400'}>
                {key === 'length' && '8+ characters'}
                {key === 'uppercase' && 'Uppercase letter'}
                {key === 'lowercase' && 'Lowercase letter'}
                {key === 'number' && 'Number'}
                {key === 'special' && 'Special character'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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

          {/* CARD */}
          <motion.div layout className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100">

            {/* MAIN API ERROR */}
            {(signupStatus.mainError || loginStatus.mainError) && (
              <div
                className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg flex items-center gap-2"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={16} /> {signupStatus.mainError || loginStatus.mainError}
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
                    <button
                      type="button"
                      onClick={() => setRole(ROLES.RIDER)}
                      className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-1 transition
                        ${role === ROLES.RIDER
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-400'
                        }`}
                      aria-pressed={role === ROLES.RIDER}
                      aria-label="Select Rider role"
                    >
                      <User size={22} />
                      <span className="text-xs font-bold">Rider</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole(ROLES.DRIVER)}
                      className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-1 transition
                        ${role === ROLES.DRIVER
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-400'
                        }`}
                      aria-pressed={role === ROLES.DRIVER}
                      aria-label="Select Driver role"
                    >
                      <Car size={22} />
                      <span className="text-xs font-bold">Driver</span>
                    </button>
                  </div>

                  {/* FULL NAME */}
                  <div>
                    <label htmlFor="signup-fullName" className="block text-xs font-bold text-slate-500 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                      <input
                        id="signup-fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        type="text"
                        placeholder="John Doe"
                        required
                        aria-required="true"
                        aria-invalid={!!signupErrors.fullName}
                        aria-describedby={signupErrors.fullName ? "fullName-error" : undefined}
                        autoFocus={!isLogin}
                        className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium transition
                          ${signupErrors.fullName ? 'border-red-500 focus:ring-2 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-100'}`}
                      />
                    </div>
                    {signupErrors.fullName && (
                      <p id="fullName-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {signupErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label htmlFor="signup-email" className="block text-xs font-bold text-slate-500 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                      <input
                        id="signup-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="name@example.com"
                        required
                        aria-required="true"
                        aria-invalid={!!signupErrors.email}
                        aria-describedby={signupErrors.email ? "email-error" : undefined}
                        className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium transition
                          ${signupErrors.email ? 'border-red-500 focus:ring-2 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-100'}`}
                      />
                    </div>
                    {signupErrors.email && (
                      <p id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {signupErrors.email}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label htmlFor="signup-password" className="block text-xs font-bold text-slate-500 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                      <input
                        id="signup-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        aria-required="true"
                        aria-invalid={!!signupErrors.password}
                        aria-describedby={signupErrors.password ? "password-error" : undefined}
                        className={`w-full bg-slate-50 border pl-11 pr-11 py-3 rounded-xl outline-none font-medium transition
                          ${signupErrors.password ? 'border-red-500 focus:ring-2 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-100'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p id="password-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {signupErrors.password}
                      </p>
                    )}
                    {showPasswordStrength && <PasswordStrengthIndicator />}
                  </div>

                  <button
                    type="submit"
                    disabled={signupStatus.loading}
                    aria-busy={signupStatus.loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {signupStatus.loading ? 'Creating your account...' : 'Create Account'} <ArrowRight size={18} />
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
                    <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                      <input
                        id="login-email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        type="email"
                        placeholder="name@example.com"
                        required
                        aria-required="true"
                        aria-invalid={!!loginErrors.email}
                        aria-describedby={loginErrors.email ? "login-email-error" : undefined}
                        autoFocus={isLogin}
                        className={`w-full bg-slate-50 border pl-11 pr-4 py-3 rounded-xl outline-none font-medium transition
                          ${loginErrors.email ? 'border-red-500 focus:ring-2 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-100'}`}
                      />
                    </div>
                    {loginErrors.email && (
                      <p id="login-email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {loginErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                      <input
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        aria-required="true"
                        aria-invalid={!!loginErrors.password}
                        aria-describedby={loginErrors.password ? "login-password-error" : undefined}
                        className={`w-full bg-slate-50 border pl-11 pr-11 py-3 rounded-xl outline-none font-medium transition
                          ${loginErrors.password ? 'border-red-500 focus:ring-2 ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-100'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p id="login-password-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loginStatus.loading}
                    aria-busy={loginStatus.loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loginStatus.loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                  </button>
                </motion.form>
              )}

            </AnimatePresence>

            {/* TOGGLE */}
            <div className="mt-6 text-center text-sm text-slate-500">
              {isLogin ? 'New to LOBBY?' : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSignupErrors({});
                  setLoginErrors({});
                  setSignupStatus({ loading: false, mainError: '' });
                  setLoginStatus({ loading: false, mainError: '' });
                }}
                className="ml-1 text-blue-600 font-bold hover:text-blue-700 transition"
              >
                {isLogin ? 'Create account' : 'Sign in'}
              </button>
            </div>

          </motion.div>

          {/* BACK LINK */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 flex justify-center gap-1 transition">
              <ChevronRight size={16} className="rotate-180" /> Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
