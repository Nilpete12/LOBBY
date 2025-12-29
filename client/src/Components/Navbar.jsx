import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Hamburger menu for mobile

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900">
          LOBBY<span className="text-blue-600">.</span>
        </Link>

        {/* Desktop Links - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <Link to="/search" className="hover:text-black transition">Find a Ride</Link>
          <Link to="/contact" className="hover:text-black transition">Support</Link>
          <Link to="/drive" className="hover:text-black transition">For Drivers</Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/Auth" className="hidden md:block text-sm font-bold text-slate-900 hover:text-blue-600 transition">
            Log In
          </Link>
          <Link to="/search" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200">
            Book Now
          </Link>
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-slate-900">
            <Menu size={24} />
          </button>
        </div>

      </div>
    </nav>
  );
}