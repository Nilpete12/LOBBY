"use client";

import Link from "next/link";
import { Menu, X, ChevronRight, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Show, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    if (
      isLoaded &&
      isSignedIn &&
      !userRole &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
    }
  }, [isLoaded, isSignedIn, userRole, pathname, router]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-[#DBEAFE]/40 shadow-sm">
        {/* CHANGED: max-w-full to max-w-7xl and removed the stray 'c' */}
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900 relative z-50"
          >
            THE LOBBY
            <span className="text-[#0F766E]">.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link
              href="/search"
              className="hover:text-[#0F766E] transition"
            >
              Find a Ride
            </Link>

            {userRole !== "driver" && (
              <Link
                href="/drive"
                className="hover:text-[#0F766E] transition"
              >
                For Drivers
              </Link>
            )}

            <Link
              href="/support"
              className="hover:text-[#0F766E] transition"
            >
              Support
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-5">

            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link
                  href={dashboardLink}
                  className="text-sm font-bold text-slate-500 hover:text-[#0F766E] transition"
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

              <Link
                href="/search"
                className="
                  bg-linear-to-r
                  from-[#0F766E]
                  to-[#0891B2]
                  text-white
                  px-5
                  py-2.5
                  rounded-full
                  text-sm
                  font-bold
                  shadow-lg
                  shadow-cyan-100
                  hover:scale-105
                  transition
                "
              >
                Book Now
              </Link>
            </Show>

          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-slate-900 p-2 relative z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-[#F8FAFC]/95
            backdrop-blur-2xl
            pt-24
            px-5
            md:hidden
            animate-in
            slide-in-from-top-10
            duration-300
          "
        >
          <div className="space-y-3">

            {/* Signed In */}
            <Show when="signed-in">

              {user && (
                <div
                  className="
                    mb-5
                    bg-white
                    rounded-3xl
                    p-5
                    border
                    border-[#DBEAFE]
                    shadow-sm
                    flex
                    items-center
                    gap-4
                  "
                >
                  <UserButton afterSignOutUrl="/" />

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {user.fullName}
                    </h3>

                    <p className="text-xs uppercase font-bold text-[#0F766E]">
                      {userRole || "Setting up..."}
                    </p>
                  </div>
                </div>
              )}

              <MobileLink
                href="/search"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Ride
              </MobileLink>

              <MobileLink
                href={dashboardLink}
                className="text-[#0F766E]"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </MobileLink>

              {userRole !== "driver" && (
                <MobileLink
                  href="/drive"
                  onClick={() => setIsMenuOpen(false)}
                >
                  For Drivers
                </MobileLink>
              )}

              <MobileLink
                href="/support"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </MobileLink>

              {/* Sign Out */}
              <div className="pt-5">

                <SignOutButton signOutCallback={() => setIsMenuOpen(false)}>
                  <button
                    className="
                      w-full
                      rounded-2xl
                      bg-red-50
                      py-4
                      px-5
                      flex
                      items-center
                      justify-between
                      font-bold
                      text-red-500
                      border
                      border-red-100
                    "
                  >
                    Sign Out

                    <LogOut size={18} />
                  </button>
                </SignOutButton>

              </div>

            </Show>

            {/* Signed Out */}
            <Show when="signed-out">

              <MobileLink
                href="/search"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Ride
              </MobileLink>

              <MobileLink
                href="/drive"
                onClick={() => setIsMenuOpen(false)}
              >
                For Drivers
              </MobileLink>

              <MobileLink
                href="/support"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </MobileLink>

              <div className="pt-5 space-y-4">

                <SignInButton mode="modal">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      block
                      w-full
                      text-center
                      font-bold
                      py-3.5
                      rounded-2xl
                      bg-white
                      border
                      border-[#DBEAFE]
                      shadow-sm
                      text-slate-800
                    "
                  >
                    Log In
                  </button>
                </SignInButton>

                <Link
                  href="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="
                    block
                    w-full
                    text-center
                    bg-linear-to-r
                    from-[#0F766E]
                    to-[#0891B2]
                    text-white
                    font-bold
                    py-4
                    rounded-2xl
                    shadow-xl
                    shadow-cyan-100
                  "
                >
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

function MobileLink({
  href,
  onClick,
  children,
  className = "",
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex
        items-center
        justify-between
        bg-white
        rounded-2xl
        px-5
        py-4
        text-base
        font-bold
        text-slate-800
        border
        border-[#DBEAFE]
        shadow-sm
        hover:border-[#0F766E]
        hover:text-[#0F766E]
        transition
        ${className}
      `}
    >
      {children}

      <ChevronRight
        size={18}
        className="text-slate-300"
      />
    </Link>
  );
}