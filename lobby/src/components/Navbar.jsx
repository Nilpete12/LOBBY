"use client";

import Link from "next/link";
import { Search, Car, LayoutDashboard, LifeBuoy } from "lucide-react"; 
import { useEffect } from "react";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = user?.publicMetadata?.role;

  const dashboardLink =
    userRole === "driver"
      ? "/drive/dashboard"
      : userRole === "rider"
      ? "/account"
      : "/onboarding";

  useEffect(() => {
    if (isLoaded && isSignedIn && !userRole && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [isLoaded, isSignedIn, userRole, pathname, router]);

  return (
    <>
      {/* --- TOP NAVBAR (Stays at top for both Mobile & PC) --- */}
      <nav className="fixed top-0 w-full z-40 bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-[#DBEAFE]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
          
          {/* Logo (Top Left) */}
          <Link
            href="/"
            className="text-lg md:text-2xl font-black tracking-tight text-slate-900 relative z-50"
          >
            THE LOBBY
            <span className="text-[#0F766E]">.</span>
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/search" className="hover:text-[#0F766E] transition">
              Find a Ride
            </Link>

            {userRole !== "driver" && (
              <Link href="/drive" className="hover:text-[#0F766E] transition">
                For Drivers
              </Link>
            )}

            <Link href="/support" className="hover:text-[#0F766E] transition">
              Support
            </Link>
          </div>

          {/* Auth Section (Top Right - Appears on Mobile & PC) */}
          <div className="flex items-center gap-3 md:gap-5">
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                {/* Hide the word Dashboard on mobile, keep it on PC */}
                <Link
                  href={dashboardLink}
                  className="hidden md:block text-sm font-bold text-slate-500 hover:text-[#0F766E] transition"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-slate-900 hover:text-[#0F766E] transition">
                  Log In
                </button>
              </SignInButton>

              {/* Hide "Book Now" pill on mobile to save space, keep on PC */}
              <Link
                href="/search"
                className="
                  hidden
                  md:block
                  bg-gradient-to-r from-[#0F766E] to-[#0891B2]
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
      <div className="md:hidden fixed bottom-3 inset-x-3 z-50 mx-auto max-w-sm pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/90 backdrop-blur-xl backdrop-saturate-200 border border-[#0F5A53]/20 shadow-[0_12px_36px_rgba(15,118,110,0.22)] rounded-full px-3 py-2 flex items-center justify-around">
          {/* Always Show: Search */}
          <BottomNavLink 
            href="/search" 
            icon={<Search size={22} />} 
            label="Ride" 
            isActive={pathname === '/search'} 
          />

          {/* Show if Signed In: Dashboard */}
          <Show when="signed-in">
            <BottomNavLink 
              href={dashboardLink} 
              icon={<LayoutDashboard size={22} />} 
              label="Dash" 
              isActive={pathname === dashboardLink || pathname === '/onboarding'} 
            />
          </Show>

          {/* Show if NOT a Driver: Drive */}
          {userRole !== "driver" && (
            <BottomNavLink 
              href="/drive" 
              icon={<Car size={22} />} 
              label="Drive" 
              isActive={pathname === '/drive'} 
            />
          )}

          {/* Always Show: Support */}
          <BottomNavLink 
            href="/support" 
            icon={<LifeBuoy size={22} />} 
            label="Support" 
            isActive={pathname === '/support'} 
          />

        </div>
      </div>
    </>
  );
}

// --- HELPER COMPONENT FOR BOTTOM TRAY LINKS ---
function BottomNavLink({ href, icon, label, isActive }) {
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center w-14 gap-1 transition-all duration-200
        ${isActive ? "text-[#0F766E]" : "text-slate-400 hover:text-slate-600"}
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <div className={`
        p-1.5 rounded-full transition-all duration-200
        ${isActive ? "bg-teal-50 scale-110" : "bg-transparent"}
      `}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? "tracking-wide" : ""}`}>
        {label}
      </span>
    </Link>
  );
}
