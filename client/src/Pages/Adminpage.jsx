import { useState, useEffect } from 'react';
import RecentUsers from '../Components/admin/RecentUsers';
import AdminLog from '../Components/admin/AdminLog';
import StatsCard from '../Components/admin/StatsCard';
import { Bell, Search, Menu, Users, Car, Phone, TrendingUp, MessageCircle, Filter } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalCalls: 0
  });

  // New: Complaints state
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'complaints'
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'rider', 'driver'

  // Fetch stats (existing)
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
  }, [isAuthenticated]);

  // New: Fetch complaints
  useEffect(() => {
    if (isAuthenticated) {
      const fetchComplaints = async () => {
        setLoadingComplaints(true);
        try {
          const res = await fetch('http://localhost:5000/api/admin/complaints');
          const data = await res.json();
          if (data.success) {
            setComplaints(data.complaints || []);
          }
        } catch (err) {
          console.error("Failed to load complaints");
        } finally {
          setLoadingComplaints(false);
        }
      };
      fetchComplaints();
    }
  }, [isAuthenticated]);

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || complaint.userType === userFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return <AdminLog onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-0 p-4 md:p-8 w-full">
        {/* Header (unchanged) */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
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

        {/* Stats Grid (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
          <StatsCard title="Total Drivers" value={stats.totalDrivers} icon={Car} trend="Active" color="indigo" />
          <StatsCard title="Live Now" value={stats.activeDrivers} icon={TrendingUp} trend="Online" color="green" />
          <StatsCard title="Total Calls" value={stats.totalCalls} icon={Phone} trend="Leads" color="orange" />
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex mb-6">
              <button 
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-2 font-bold rounded-xl ${activeTab === 'applications' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}
              >
                Recent Applications
              </button>
              <button 
                onClick={() => setActiveTab('complaints')}
                className={`ml-3 px-6 py-2 font-bold rounded-xl ${activeTab === 'complaints' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}
              >
                Recent Complaints
              </button>
            </div>

            {activeTab === 'applications' ? (
              <RecentUsers />
            ) : (
              <>
                {/* Complaints Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle size={24} className="text-blue-600" />
                    Recent Complaints ({filteredComplaints.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white px-3 py-2 rounded-xl border">
                      <Filter size={18} className="text-slate-400 mr-2" />
                      <select 
                        value={userFilter} 
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-transparent outline-none text-sm"
                      >
                        <option value="all">All Users</option>
                        <option value="rider">Riders</option>
                        <option value="driver">Drivers</option>
                      </select>
                    </div>
                    <div className="flex bg-white px-4 py-2.5 rounded-xl border">
                      <Search size={18} className="text-slate-400 mr-2" />
                      <input 
                        type="text" 
                        placeholder="Search complaints..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none text-sm w-48" 
                      />
                    </div>
                  </div>
                </div>

                {/* Complaints Table */}
                {loadingComplaints ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500">Loading complaints...</div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500">No complaints found.</div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredComplaints.map((complaint) => (
                            <tr key={complaint.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${complaint.userType === 'rider' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                    {complaint.userType === 'rider' ? 'R' : 'D'}
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-bold text-sm text-slate-900">{complaint.userName}</p>
                                    <p className="text-xs text-slate-500">{complaint.userType}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-sm text-slate-900">{complaint.subject}</p>
                                <p className="text-xs text-slate-500 truncate max-w-xs">{complaint.description}</p>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{complaint.date}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {complaint.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">View</button>
                                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition">Resolve</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pending Approvals Widget (unchanged) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl h-fit">
            <h3 className="font-bold text-lg mb-4">Pending Approvals</h3>
            <p className="text-slate-400 text-sm mb-6">
              {stats.pendingDrivers || 0} Drivers are waiting for verification.
            </p>
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
