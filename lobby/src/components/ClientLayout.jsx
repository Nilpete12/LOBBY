"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstallPopup from '@/components/popup'; // Check your exact filename capitalization here!

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current path starts with "/admin"
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {/* Conditionally render Navbar */}
      {!isAdmin && <Navbar />}
      
      {!isAdmin && <InstallPopup />}
      
      {/* The 'children' prop represents whatever page the user is currently on */}
      <main className="grow pb-24 md:pb-0">
        {children}
      </main>

      {/* Conditionally render Footer */}
      {!isAdmin && <Footer />} 
    </>
  );
}
