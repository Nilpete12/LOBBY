import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ClientLayout from '@/components/ClientLayout';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import localFont from 'next/font/local';

export const metadata = {
  title: 'THE LOBBY | Direct Rides',
  description: 'Connect directly with drivers. No middlemen, fair prices.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'THE LOBBY',
  },
};

export const viewport = {
  themeColor: '#121212',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-[#090909] font-sans text-white antialiased flex flex-col">
          <ServiceWorkerRegister />

          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
