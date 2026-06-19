"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Users, Car, Phone, TrendingUp, Bell } from 'lucide-react';

import UserTable from '@/components/admin/UserTable';
import StatsCard from '@/components/admin/StatsCard';
import AdminLog from '@/components/admin/Adminlog';
import Sidebar from '@/components/admin/Sidebar';
import API_BASE_URL from '@/config';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState({
  maintenance: false,
  registration: true
});

  const [stats, setStats] = useState({ totalUsers: 0, totalDrivers: 0, activeDrivers: 0, totalCalls: 0 });

  useEffect(() => {
  if (activeTab === 'complaints') {
    fetch(`${API_BASE_URL}/admin/complaints`) // <--- Direct URL
      .then(res => res.json())
      .then(data => {
        if (data.success) setComplaints(data.complaints);
      });
  }
}, [activeTab]);

const resolveComplaint = async (id) => {
  const res = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, { method: 'PUT' });
  if (res.ok) {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'resolved' } : c));
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      const fetchStats = async () => {
        try {
          // FIX: Direct Localhost URL
          const res = await fetch(`${API_BASE_URL}/admin/stats`);
          const data = await res.json();
          if (data.success) setStats(data.stats);
        } catch (err) { console.error("Stats Error"); }
      };
      fetchStats();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) return <AdminLog onLogin={() => setIsAuthenticated(true)} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'riders':
        return <UserTable role="rider" />;
      case 'drivers':
        return <UserTable role="driver" />;
      case 'complaints':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Complaints & Support</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4">From</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Topic</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id} className="border-b border-slate-50">
                    <td className="p-4">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>

                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-xs font-bold uppercase rounded-md">{c.role}</span>
                    </td>
                    <td className="p-4 text-sm">{c.topic}</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{c.message}</td>
                    <td className="p-4">
                      {c.status === 'resolved' 
                        ? <span className="text-green-600 font-bold text-xs">Resolved</span> 
                        : <span className="text-red-500 font-bold text-xs">Pending</span>}
                    </td>
                    <td className="p-4">
                      {c.status !== 'resolved' && (
                        <button onClick={() => resolveComplaint(c._id)} className="text-xs bg-black text-white px-3 py-1 rounded-md">
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Settings</h2>
              
              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-slate-50">
                <div>
                  <h3 className="font-bold text-slate-700">Maintenance Mode</h3>
                  <p className="text-sm text-slate-500">Disable the app for all users temporarily.</p>
                </div>
                <button 
                  onClick={() => setSettings(s => ({...s, maintenance: !s.maintenance}))}
                  className={`w-12 h-6 rounded-full relative transition duration-300 ${settings.maintenance ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.maintenance ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>

              {/* Registration Toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-bold text-slate-700">Allow New Registrations</h3>
                  <p className="text-sm text-slate-500">Stop new drivers/riders from signing up.</p>
                </div>
                <button 
                  onClick={() => setSettings(s => ({...s, registration: !s.registration}))}
                  className={`w-12 h-6 rounded-full relative transition duration-300 ${settings.registration ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.registration ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            </div>

            <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
              <h3 className="font-bold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">Irreversible actions for system management.</p>
              <button 
                onClick={() => window.confirm("Are you surely you want to wipe all analytics data? This cannot be undone.") && alert("Data reset command sent.")}
                className="bg-white text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-600 hover:text-white transition"
              >
                Reset All Analytics Data
              </button>
            </div>
          </div>
        );
  
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
              <StatsCard title="Total Drivers" value={stats.totalDrivers} icon={Car} trend="Active" color="indigo" />
              <StatsCard title="Live Now" value={stats.activeDrivers} icon={TrendingUp} trend="Online" color="green" />
              <StatsCard title="Total Calls" value={stats.totalCalls} icon={Phone} trend="Leads" color="orange" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UserTable limit={5} />
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {stats.pendingDrivers || 0} Drivers are waiting for verification.
                </p>
                <button 
                  onClick={() => setActiveTab('drivers')}
                  className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition"
                >
                  View All Drivers
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={() => { setIsAuthenticated(false); navigate('/'); }} 
      />

      <main className="flex-1 md:ml-0 p-4 md:p-8 w-full h-screen overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white rounded-lg border border-slate-200">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            </div>
          </div>
          <button className="relative p-2.5 bg-white rounded-xl border border-slate-200">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {renderContent()}

      </main>
    </div>
  );
}