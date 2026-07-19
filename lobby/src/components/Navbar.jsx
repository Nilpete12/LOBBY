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
    let frameId = 0;
    let darkSections = Array.from(document.querySelectorAll('.dark-section'));

    const measureNavBackground = () => {
      frameId = 0;
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

    const requestMeasure = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(measureNavBackground);
    };

    const refreshSections = () => {
      darkSections = Array.from(document.querySelectorAll('.dark-section'));
      requestMeasure();
    };

    refreshSections();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', refreshSections);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', refreshSections);
    };
  }, [pathname]);

  return (
    <>
      {/* --- TOP NAVBAR (Stays at top for both Mobile & PC) --- */}
      <nav className="fixed top-0 w-full z-40 bg-[#0B0B0B]/82 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo (Top Left) */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-['Sailors_Slant_Normal'] tracking-tight text-white relative z-50"
          >
            THE LOBBY
            <span className="text-[#FFC857]">.</span>
          </Link>

          {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-semibold text-[#b3b3b3]">
            {/* 1. VIEW: SIGNED OUT */}
            <Show when="signed-out">
              <Link href="/search" className="hover:text-[#FFC857] transition">Find a Ride</Link>
              <Link href="/drive" className="hover:text-[#FFC857] transition">For Drivers</Link>
              <Link href="/support" className="hover:text-[#FFC857] transition">Support</Link>
            </Show>

            <Show when="signed-in">
              {/* 2. VIEW: LOGGED IN AS RIDER (or no role yet) */}
              {userRole !== "driver" && (
                <>
                  <Link href="/search" className="hover:text-[#FFC857] transition">All Services</Link>
                  <Link href="/favourites" className="hover:text-[#FFC857] transition">Favourites</Link>
                  <Link href="/account" className="hover:text-[#FFC857] transition">Profile</Link>
                  <Link href="/support" className="hover:text-[#FFC857] transition">Support</Link>
                </>
              )}

              {/* 3. VIEW: LOGGED IN AS DRIVER */}
              {userRole === "driver" && (
                <>
                  <Link href="/drive/dashboard" className="hover:text-[#FFC857] transition">Profile</Link>
                  <Link href="/drive/earnings" className="hover:text-[#FFC857] transition">Analytics</Link>
                  <Link href="/drive/TripHistory" className="hover:text-[#FFC857] transition">Trip History</Link>
                  <Link href="/support" className="hover:text-[#FFC857] transition">Support</Link>
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
                <button className="text-sm font-bold text-white hover:text-[#FFC857] transition">
                  Log In
                </button>
              </SignInButton>

              <Link
                href="/search"
                className="
                  hidden md:block
                  bg-[#FFC857] hover:bg-[#F59E0B]
                  text-[#1A1205] px-5 py-2.5 rounded-full text-sm font-bold
                  shadow-lg shadow-[#FFC857]/25 hover:scale-105 transition
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
            ? 'bg-[#121212]/82 border-white/10 shadow-black/30' // DARK MODE GLASS
            : 'bg-[#121212]/82 border-white/10 shadow-black/30' // DARK MODE GLASS
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
                <BottomNavLink href="/drive/earnings" icon={<Wallet size={22} />} label="Analytics" isActive={pathname === '/drive/earnings'} isDarkBg={isDarkBg} />
                <BottomNavLink href="/drive/TripHistory" icon={<LayoutDashboard size={22} />} label="Trip History" isActive={pathname === '/drive/TripHistory'} isDarkBg={isDarkBg} />
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
  const activeColor = isDarkBg ? "text-[#FFC857]" : "text-[#FFC857]";
  const inactiveColor = isDarkBg ? "text-[#b3b3b3] hover:text-white" : "text-[#b3b3b3] hover:text-white";
  const activeBg = isDarkBg ? "bg-[#242424]/90" : "bg-[#242424]/90";

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center w-14 gap-1 transition-all duration-200 active:scale-95
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
