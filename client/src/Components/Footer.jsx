import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white block mb-4">
              LOBBY<span className="text-blue-500">.</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The trusted drive directory for Shillong and the North East. Connecting locals directly.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition"><Facebook size={20} /></a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/search" className="hover:text-white transition">Find a Ride</Link></li>
              <li><Link to="/drive" className="hover:text-white transition">Driver Sign Up</Link></li>
              <li><Link to="/auth" className="hover:text-white transition">Log In</Link></li>
              <li><Link to="/search" className="hover:text-white transition">Popular Routes</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/Support" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Admin Login</Link></li>
              <li><a href="/privacypolicy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/T&C" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div>
            <h4 className="text-white font-bold mb-6">Location</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-0.5" />
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
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} LOBBY Platform. All rights reserved.</p>
          <p>Made with ❤️ in the hills.</p>
        </div>

      </div>
    </footer>
  );
}