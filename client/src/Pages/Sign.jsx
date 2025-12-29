import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, ChevronRight, Car, MapPin } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('rider'); // Default role

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* --- LEFT SIDE (Unchanged) --- */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden items-center bg-slate-900 justify-center text-white p-12 z-10">
        <div className="absolute inset-0 bg-[url('data:image/jpeg;base64,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')] bg-cover bg-center opacity-40 grayscale mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="relative z-20 max-w-lg">
          <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Start your journey <br/>
            <span className="text-blue-400">with local experts.</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            "Joining LOBBY changed how I travel in the North East. Finding reliable drivers for outstation trips used to be a hassle, now it's instant."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold">A</div>
            <div>
              <p className="font-bold">Amit Sharma</p>
              <p className="text-sm text-slate-400">Frequent Traveler</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE --- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md">
          
          <div className="mb-8 mt-16">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-500">
              {isLogin ? 'Sign in to manage your rides.' : 'Join as a Rider or Driver.'}
            </p>
          </div>

          <motion.div layout className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <AnimatePresence mode='wait'>
              
              {/* --- SIGN UP FORM --- */}
              {!isLogin && (
                <motion.form 
                  key="signup"
                  variants={formVariants}
                  initial="hidden" animate="visible" exit="exit"
                  className="space-y-4"
                >
                  {/* ROLE SELECTOR CARDS */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      onClick={() => setRole('rider')}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'rider' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-400'}`}
                    >
                      <User size={24} />
                      <span className="font-bold text-sm">Rider</span>
                    </div>

                    <div 
                      onClick={() => setRole('driver')}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${role === 'driver' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-400'}`}
                    >
                      <Car size={24} />
                      <span className="font-bold text-sm">Driver</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium" />
                    </div>
                  </div>

                  <SharedFields />
                  
                  {/* Dynamic Button Text */}
                  <ActionButton text={role === 'driver' ? "Join as Driver" : "Create Account"} />
                </motion.form>
              )}

              {/* --- LOGIN FORM --- */}
              {isLogin && (
                 <motion.form 
                   key="login"
                   variants={formVariants}
                   initial="hidden" animate="visible" exit="exit"
                   className="space-y-4"
                 >
                   <SharedFields />
                   <div className="flex justify-end">
                      <a href="#" className="text-sm font-bold text-blue-600 hover:underline">Forgot password?</a>
                   </div>
                   <ActionButton text="Sign In" />
                 </motion.form>
              )}
            </AnimatePresence>
            
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              {isLogin ? "New to LOBBY?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
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

function SharedFields() {
  return (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input type="email" placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium" />
        </div>
      </div>
    </>
  )
}

function ActionButton({ text }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition mt-2 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
    >
      {text} <ArrowRight size={20} />
    </motion.button>
  )
}