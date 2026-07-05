"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstallPopup from '@/components/popup'; // Check your exact filename capitalization here!
import PlatformGate from '@/components/PlatformGate';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current path starts with "/admin"
  const isAdmin = pathname?.startsWith('/admin');

  const content = (
    <>
      {/* Conditionally render Navbar */}
      {!isAdmin && <Navbar />}
      
      {!isAdmin && <InstallPopup />}
      
      {/* The 'children' prop represents whatever page the user is currently on */}
      <main className="grow">
        {children}
      </main>

      {/* Conditionally render Footer */}
      {!isAdmin && <Footer />} 
    </>
  );

  return isAdmin ? content : <PlatformGate>{content}</PlatformGate>;
}
