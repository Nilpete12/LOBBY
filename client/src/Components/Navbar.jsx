import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/Authcontext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900 z-50 relative">
            LOBBY<span className="text-blue-600">.</span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link to="/search" className="hover:text-black transition">Find a Ride</Link>
            {(!user || user.role === 'driver') && (
              <Link to="/drive" className="hover:text-black transition">For Drivers</Link>
            )}
            <Link to="/contact" className="hover:text-black transition">Support</Link>
          </div>

          {/* --- DESKTOP AUTH BUTTONS --- */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // Logged In State
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                  {user.fullName.split(' ')[0]}
                </span>
                
                <Link 
                  to={user.role === 'driver' ? '/drive/dashboard' : user.role === 'admin' ? '/admin' : '/'} 
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="bg-slate-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              // Logged Out State
              <>
                <Link to="/auth" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                  Log In
                </Link>
                <Link to="/search" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* --- MOBILE TOGGLE BUTTON --- */}
          <button 
            className="md:hidden text-slate-900 p-2 z-50 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in slide-in-from-top-10 duration-200">
          <div className="flex flex-col space-y-2">
            
            {/* User Profile Section (Mobile) */}
            {user && (
              <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{user.fullName}</h3>
                  <p className="text-slate-500 text-xs uppercase font-bold">{user.role}</p>
                </div>
              </div>
            )}

            {/* Links */}
            <MobileLink to="/search" onClick={() => setIsMenuOpen(false)}>Find a Ride</MobileLink>
            
            {/* Dashboard Link (Only if logged in) */}
            {user && (
              <MobileLink 
                to={user.role === 'driver' ? '/drive/dashboard' : user.role === 'admin' ? '/admin' : '/'} 
                onClick={() => setIsMenuOpen(false)}
                className="text-blue-600"
              >
                Go to Dashboard
              </MobileLink>
            )}

            {(!user || user.role === 'driver') && (
              <MobileLink to="/drive" onClick={() => setIsMenuOpen(false)}>For Drivers</MobileLink>
            )}
            
            <MobileLink to="/contact" onClick={() => setIsMenuOpen(false)}>Support</MobileLink>

            {/* Auth Actions */}
            <div className="pt-6 mt-4 border-t border-slate-100">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between text-lg font-bold text-red-500 py-3"
                >
                  Sign Out <LogOut size={20} />
                </button>
              ) : (
                <div className="space-y-4">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block w-full text-center text-slate-900 font-bold py-3 border border-slate-200 rounded-xl">
                    Log In
                  </Link>
                  <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl">
                    Book a Ride
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// Helper Component for cleaner code
function MobileLink({ to, onClick, children, className = "" }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center justify-between text-lg font-bold text-slate-900 py-4 border-b border-slate-50 ${className}`}
    >
      {children} <ChevronRight size={16} className="text-slate-300" />
    </Link>
  );
}