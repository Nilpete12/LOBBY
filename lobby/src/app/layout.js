import './globals.css';
import { AuthProvider } from '@/context/Authcontext';
import ClientLayout from '@/components/ClientLayout';

// This replaces the old <title> tag in your index.html! Next.js injects this for SEO automatically.
export const metadata = {
  title: 'LOBBY | Direct Rides',
  description: 'Connect directly with drivers. No middlemen, fair prices.',
  manifest: '/manifest.webmanifest', // Links your PWA manifest
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased flex flex-col">
        {/* We wrap the whole app in the AuthProvider so every page knows who is logged in */}
        <AuthProvider>
          
          {/* We wrap the app in the ClientLayout to handle the Navbar/Footer logic */}
          <ClientLayout>
            {children}
          </ClientLayout>

        </AuthProvider>
      </body>
    </html>
  );
}