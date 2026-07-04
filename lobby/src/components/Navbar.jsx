"use client";

import Link from "next/link";
// 1. Imported all the new dynamic icons needed for Rider & Driver states
import { 
  Search, 
  Car, 
  LayoutDashboard, 
  LifeBuoy, 
  LayoutGrid, 
  Heart, 
  User, 
  Wallet, 
  UserCircle 
} from "lucide-react"; 
import { useEffect, useState } from "react";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isDarkBg, setIsDarkBg] = useState(false);
  const userRole = user?.publicMetadata?.role;

  // Handles the redirect logic if they haven't finished onboarding
  useEffect(() => {
    if (isLoaded && isSignedIn && !userRole && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [isLoaded, isSignedIn, userRole, pathname, router]);

  useEffect(() => {
    const handleScroll = () => {
      // Find every section on your page that has the class "dark-section"
      const darkSections = document.querySelectorAll('.dark-section');
      let overDark = false;

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // The navbar is at the bottom of the screen. 
        // We check if the bottom 100px of the viewport is currently inside a dark section.
        if (rect.top < window.innerHeight - 24 && rect.bottom > window.innerHeight - 80) {
          overDark = true;
        }
      });

      setIsDarkBg(overDark);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* --- TOP NAVBAR (Stays at top for both Mobile & PC) --- */}
      <nav className="fixed top-0 w-full z-40 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-[#DBEAFE]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo (Top Left) */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-['Sailors_Slant_Normal'] tracking-tight text-slate-900 relative z-50"
          >
            THE LOBBY
            <span className="text-[#0F766E]">.</span>
          </Link>

          {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-semibold text-slate-600">            
            {/* 1. VIEW: SIGNED OUT */}
            <Show when="signed-out">
              <Link href="/search" className="hover:text-[#0F766E] transition">Find a Ride</Link>
              <Link href="/drive" className="hover:text-[#0F766E] transition">For Drivers</Link>
              <Link href="/support" className="hover:text-[#0F766E] transition">Support</Link>
            </Show>

            <Show when="signed-in">
              {/* 2. VIEW: LOGGED IN AS RIDER (or no role yet) */}
              {userRole !== "driver" && (
                <>
                  <Link href="/search" className="hover:text-[#0F766E] transition">All Services</Link>
                  <Link href="/favourites" className="hover:text-[#0F766E] transition">Favourites</Link>
                  <Link href="/account" className="hover:text-[#0F766E] transition">Profile</Link>
                  <Link href="/support" className="hover:text-[#0F766E] transition">Support</Link>
                </>
              )}

              {/* 3. VIEW: LOGGED IN AS DRIVER */}
              {userRole === "driver" && (
                <>
                  <Link href="/drive/dashboard" className="hover:text-[#0F766E] transition">Profile</Link>
                  <Link href="/drive/earnings" className="hover:text-[#0F766E] transition">Earnings</Link>
                  <Link href="/drive/tripHistory" className="hover:text-[#0F766E] transition">Trip History</Link>
                  <Link href="/support" className="hover:text-[#0F766E] transition">Support</Link>
                </>
              )}
            </Show>
          </div>

          {/* --- AUTH SECTION (Top Right) --- */}
          <div className="flex items-center gap-5">
            <Show when="signed-in">
              {/* Radically simplified: Just the profile picture since nav links handle the rest now */}
              <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-slate-900 hover:text-[#0F766E] transition">
                  Log In
                </button>
              </SignInButton>

              <Link
                href="/search"
                className="
                  hidden md:block
                  bg-linear-to-r from-[#0F766E] to-[#0891B2]
                  text-white px-5 py-2.5 rounded-full text-sm font-bold
                  shadow-lg shadow-cyan-100 hover:scale-105 transition
                "
              >
                Book Now
              </Link>
            </Show>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM PILL TRAY (Hidden on PC) --- */}
      <div className="md:hidden fixed bottom-5 inset-x-6 z-50 mx-auto max-w-sm transition-colors duration-300">
        <div className={`
          backdrop-blur-sm backdrop-saturate-200 border shadow-lg rounded-full px-4 py-1.5 flex items-center justify-around transition-colors duration-500
          ${isDarkBg 
            ? 'bg-slate-900/60 border-slate-700/80 shadow-black/20' // DARK MODE GLASS
            : 'bg-white/60 border-[#0F5A53]/30 shadow-[#0F766E]/10' // LIGHT MODE GLASS
          }
        `}>         
          
          {/* 1. VIEW: SIGNED OUT */}
          <Show when="signed-out">
            <BottomNavLink href="/search" icon={<Search size={22} />} label="Ride" isActive={pathname === '/search'} isDarkBg={isDarkBg} />
            <BottomNavLink href="/drive" icon={<Car size={22} />} label="Drive" isActive={pathname === '/drive'} isDarkBg={isDarkBg} />
            <BottomNavLink href="/support" icon={<LifeBuoy size={22} />} label="Support" isActive={pathname === '/support'} isDarkBg={isDarkBg} />
          </Show>

          <Show when="signed-in">
            {/* 2. VIEW: LOGGED IN AS RIDER */}
            {userRole !== "driver" ? (
              <>
                <BottomNavLink href="/search" icon={<LayoutGrid size={22} />} label="Services" isActive={pathname === '/search'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/favourites" icon={<Heart size={22} />} label="Favs" isActive={pathname === '/favourites'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/account" icon={<User size={22} />} label="Profile" isActive={pathname === '/account'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/support" icon={<LifeBuoy size={22} />} label="Support" isActive={pathname === '/support'} isDarkBg={isDarkBg} />
              </>
            ) : 
            /* 3. VIEW: LOGGED IN AS DRIVER */
            (
              <>
                <BottomNavLink href="/drive/dashboard" icon={<UserCircle size={22} />} label="Profile" isActive={pathname === '/drive/dashboard'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/drive/earnings" icon={<Wallet size={22} />} label="Earnings" isActive={pathname === '/drive/earnings'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/drive/tripHistory" icon={<LayoutDashboard size={22} />} label="Trip History" isActive={pathname === '/drive/trip-history'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/support" icon={<LifeBuoy size={22} />} label="Support" isActive={pathname === '/support'} isDarkBg={isDarkBg} />
              </>
            )}
          </Show>

        </div>
      </div>
    </>
  );
}

// --- HELPER COMPONENT FOR BOTTOM TRAY LINKS ---
function BottomNavLink({ href, icon, label, isActive, isDarkBg }) {
  
  // Dynamic color logic based on the background!
  const activeColor = isDarkBg ? "text-emerald-400" : "text-[#0F766E]";
  const inactiveColor = isDarkBg ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800";
  const activeBg = isDarkBg ? "bg-slate-800/80" : "bg-teal-50";

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300
        ${isActive ? activeColor : inactiveColor}
      `}
    >
      <div className={`
        p-1.5 rounded-full transition-all duration-300
        ${isActive ? `${activeBg} scale-110` : "bg-transparent"}
      `}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? "tracking-wide" : ""}`}>
        {label}
      </span>
    </Link>
  );
}