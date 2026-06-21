import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ClientLayout from '@/components/ClientLayout';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

// This replaces the old <title> tag in your index.html! Next.js injects this for SEO automatically.
export const metadata = {
  title: 'LOBBY | Direct Rides',
  description: 'Connect directly with drivers. No middlemen, fair prices.',
  manifest: '/manifest.json', // Links your PWA manifest
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="LOBBY" />
        </head>
        <body className="min-h-screen bg-white font-sans text-slate-900 antialiased flex flex-col">
          {/* Service Worker Registration */}
          <ServiceWorkerRegister />
            
            {/* We wrap the app in the ClientLayout to handle the Navbar/Footer logic */}
            <ClientLayout>
              {children}
            </ClientLayout>
            
        </body>
      </html>
    </ClerkProvider>
  );
}
