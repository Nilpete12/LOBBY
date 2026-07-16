import Link from 'next/link';
// import { Facebook, Instagram, Twitter, Map-Pin } from 'lucide-react';
import { MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-[#b3b3b3] py-16 border-t border-white/10 dark-section">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-[Sailors_Slant_Normal] tracking-tight text-white block mb-4">
             THE LOBBY<span className="text-[#1ED760]">.</span>
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
              <li><Link href="/search" className="hover:text-[#1ED760] transition">Find a Ride</Link></li>
              <li><Link href="/drive" className="hover:text-[#1ED760] transition">Driver Sign Up</Link></li>
              <li><Link href="/sign-in" className="hover:text-[#1ED760] transition">Log In</Link></li>
              <li><Link href="/search" className="hover:text-[#1ED760] transition">Popular Routes</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="hover:text-[#1ED760] transition">About Us</Link></li>
              <li><Link href="/admin" className="hover:text-[#1ED760] transition">Admin Login</Link></li>
              <li><Link href="/privacypolicy" className="hover:text-[#1ED760] transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#1ED760] transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div>
            <h4 className="text-white font-semibold mb-6">Location</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#1ED760] mt-0.5" />
                <span>
                  In Your Neighbourhood,<br />
                  Kohima, Nagaland<br />
                  797001
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-row justify-between items-center gap-3 text-xs text-[#b3b3b3] font-[proxima_nova_regular]"> <p>&copy; {new Date().getFullYear()} <span className="font-[Sailors_Slant_Normal]">THE LOBBY</span> Platform. All rights reserved.</p> 
        <p className="flex items-center gap-1">Made with <Heart size={16} className="text-[#1ED760]" /> in the hills.</p> 
        </div>


      </div>
    </footer>
  );
}
