"use client";
import Link from 'next/link';
import { Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Show, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 1. Get Clerk user data and session state
  const { user, isLoaded, isSignedIn } = useUser(); 
  
  // 2. Get Next.js routing hooks
  const router = useRouter(); 
  const pathname = usePathname(); 
  
  // 3. Determine the user's role and where their dashboard is
  const userRole = user?.publicMetadata?.role;  
  const dashboardLink = userRole === 'driver' ? '/drive/dashboard' : userRole === 'rider' ? '/account' : '/onboarding';

  // --- THE SECURITY GUARD ---
  // If a user logs in but hasn't picked Rider/Driver yet, force them to the onboarding page.
  useEffect(() => {
    if (isLoaded && isSignedIn && !userRole && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [isLoaded, isSignedIn, userRole, pathname, router]);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 z-50 relative">
            THE LOBBY<span className="text-[#0F5A53]">.</span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/search" className="hover:text-black transition">Find a Ride</Link>
            {userRole !== 'driver' && (
              <Link href="/drive" className="hover:text-black transition">For Drivers</Link>
            )}
            <Link href="/support" className="hover:text-black transition">Support</Link>
          </div>

          {/* --- DESKTOP AUTH BUTTONS --- */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Show when logged in */}
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link 
                  href={dashboardLink} 
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>

            {/* Show when logged out */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                  Log In
                </button>
              </SignInButton>
              <Link href="/search" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200">
                Book Now
              </Link>
            </Show>

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
            
            <Show when="signed-in">
              {user && (
                <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{user.fullName}</h3>
                    <p className="text-slate-500 text-xs uppercase font-bold">{userRole || "Setting up..."}</p>
                  </div>
                </div>
              )}

              <MobileLink href="/search" onClick={() => setIsMenuOpen(false)}>Find a Ride</MobileLink>
              
              <MobileLink 
                href={dashboardLink} 
                onClick={() => setIsMenuOpen(false)}
                className="text-blue-600"
              >
                Go to Dashboard
              </MobileLink>

              {userRole !== 'driver' && (
                <MobileLink href="/drive" onClick={() => setIsMenuOpen(false)}>For Drivers</MobileLink>
              )}
              
              <MobileLink href="/support" onClick={() => setIsMenuOpen(false)}>Support</MobileLink>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <SignOutButton signOutCallback={() => setIsMenuOpen(false)}>
                  <button className="w-full flex items-center justify-between text-lg font-bold text-red-500 py-3">
                    Sign Out <LogOut size={20} />
                  </button>
                </SignOutButton>
              </div>
            </Show>

            <Show when="signed-out">
              <MobileLink href="/search" onClick={() => setIsMenuOpen(false)}>Find a Ride</MobileLink>
              <MobileLink href="/drive" onClick={() => setIsMenuOpen(false)}>For Drivers</MobileLink>
              <MobileLink href="/support" onClick={() => setIsMenuOpen(false)}>Support</MobileLink>

              <div className="pt-6 mt-4 border-t border-slate-100 space-y-4">
                <SignInButton mode="modal">
                  <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block w-full text-center text-slate-900 font-bold py-3 border border-slate-200 rounded-xl"
                  >
                    Log In
                  </button>
                </SignInButton>
                <Link href="/search" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl">
                  Book a Ride
                </Link>
              </div>
            </Show>

          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({ href, onClick, children, className = "" }) {
  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className={`flex items-center justify-between text-lg font-bold text-slate-900 py-4 border-b border-slate-50 ${className}`}
    >
      {children} <ChevronRight size={16} className="text-slate-300" />
    </Link>
  );
}