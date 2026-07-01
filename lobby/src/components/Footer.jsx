import Link from 'next/link';
// import { Facebook, Instagram, Twitter, Map-Pin } from 'lucide-react';
import { MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#033b37] text-slate-300 py-16 border-t border-[#3F4E4F] dark-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-[Sailors_Slant_Normal] tracking-tight text-white block mb-4">
             THE LOBBY<span className="text-[#F08991]">.</span>
            </Link>

            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
              The trusted drive directory for Nagaland. Connecting locals directly.
            </p>

            <div className="flex gap-4">
              {/* <a href="#" className="hover:text-white transition"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition"><Facebook size={20} /></a> */}
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/search" className="hover:text-[#BBF7D0] transition">Find a Ride</Link></li>
              <li><Link href="/drive" className="hover:text-[#BBF7D0] transition">Driver Sign Up</Link></li>
              <li><Link href="/sign-in" className="hover:text-[#BBF7D0] transition">Log In</Link></li>
              <li><Link href="/search" className="hover:text-[#BBF7D0] transition">Popular Routes</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="hover:text-[#BBF7D0] transition">About Us</Link></li>
              <li><Link href="/admin" className="hover:text-[#BBF7D0] transition">Admin Login</Link></li>
              <li><Link href="/privacypolicy" className="hover:text-[#BBF7D0] transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#BBF7D0] transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div>
            <h4 className="text-white font-semibold mb-6">Location</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#F08991] mt-0.5" />
                <span>
                  Laitumkhrah Main Road,<br />
                  Shillong, Meghalaya<br />
                  793003
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-[#3F4E4F] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#c7c5c5] font-medium">
          <p>&copy; {new Date().getFullYear()} THE LOBBY Platform. All rights reserved.</p>
          <p>Made with ❤️ in the hills.</p>
        </div>

      </div>
    </footer>
  );
}
