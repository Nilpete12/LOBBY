import { useState, useEffect } from 'react';
import RecentUsers from '../Components/admin/RecentUsers';
import AdminLog from '../Components/admin/AdminLog'; // Ensure spelling matches your filename
import StatsCard from '../Components/admin/StatsCard'; // Ensure you have this component
import { Bell, Search, Menu, Users, Car, Phone, TrendingUp } from 'lucide-react';

// If you have a separate Sidebar component, keep using it. 
// Otherwise, we can render a simple one here or import it.
import Sidebar from '../components/admin/Sidebar'; 

export default function AdminPage() {
  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 2. Real Analytics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalCalls: 0
  });

  // 3. Fetch Real Stats (Only runs if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      const fetchStats = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/admin/stats');
          const data = await res.json();
          if (data.success) {
            setStats(data.stats);
          }
        } catch (err) {
          console.error("Failed to load stats");
        }
      };
      fetchStats();
    }
  }, [isAuthenticated]); // Run when user logs in

  // 4. Gatekeeper: Show Login if not authenticated
  if (!isAuthenticated) {
    return <AdminLog onLogin={() => setIsAuthenticated(true)} />;
  }

  // 5. The Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar (Assuming you have this component) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-0 p-4 md:p-8 w-full">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 bg-white rounded-lg border border-slate-200 text-slate-600"
            >
              <Menu size={24} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm hidden sm:block">Welcome back, Admin.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              <Search size={18} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm font-medium" />
            </div>
            <button className="relative p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
             <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* --- REAL STATS GRID --- */}
        {/* We replaced <Statsgrid /> with this direct code so we can inject 'stats' data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users}  
            color="blue"
          />
          <StatsCard 
            title="Total Drivers" 
            value={stats.totalDrivers} 
            icon={Car} 
            trend="Active" 
            color="indigo"
          />
          <StatsCard 
            title="Live Now" 
            value={stats.activeDrivers} 
            icon={TrendingUp} 
            trend="Online" 
            color="green"
          />
          <StatsCard 
            title="Total Calls" 
            value={stats.totalCalls} 
            icon={Phone} 
            trend="Leads" 
            color="orange"
          />
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Users Table */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Applications</h2>
            <RecentUsers />
          </div>
          
          {/* Right Sidebar Widget */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
             <h3 className="font-bold text-lg mb-4">Pending Approvals</h3>
             <p className="text-slate-400 text-sm mb-6">
               {stats.pendingDrivers || 0} Drivers are waiting for verification.
             </p>
             
             {/* Mock List for visual - you could map this to real pending drivers too */}
             <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">?</div>
                    <span className="font-bold text-sm">New Applicant</span>
                  </div>
                  <button className="text-blue-400 text-xs font-bold hover:text-blue-300">Review</button>
                </div>
             </div>

             <button className="w-full mt-6 bg-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition">
               View All Requests
             </button>
          </div>
        </div>

      </main>
    </div>
  );
}