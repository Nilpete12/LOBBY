import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Trash2, Search } from 'lucide-react';
import API_BASE_URL from '../config';

export default function UserTable({ role, limit }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      // FIX: Direct Localhost URL
      const res = await fetch(`${API_BASE_URL}/admin/users`);
      const data = await res.json();
      if (data.success) {
        console.log("🔥 RAW DATA FROM SERVER:", data.users); // <--- Add this spy
        let filtered = data.users;
        if (role) {
        console.log(`🧐 Filtering for role: "${role}"`);
        filtered = filtered.filter(u => {
          console.log(`   Checking ${u.fullName}: role is "${u.role}"`); // <--- Add this spy
          return u.role === role;
        });
      }
        setUsers(filtered);
      }
    } catch (err) { 
      console.error("Failed to load users", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  const handleApprove = async (id) => {
    if(!window.confirm("Verify this driver?")) return;
    // FIX: Direct Localhost URL
    await fetch(`${API_BASE_URL}/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This will permanently delete this user.")) return;
    // FIX: Direct Localhost URL
    await fetch(`${API_BASE_URL}/admin/user/${id}`, {
      method: 'DELETE'
    });
    fetchUsers();
  };

  const displayUsers = users
    .filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, limit || users.length);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading records...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-lg text-slate-900 capitalize">{role ? `${role}s Directory` : 'Recent Users'}</h3>
        <div className="flex items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-64">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            className="bg-transparent outline-none text-sm w-full"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Identity</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                      {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover"/> : user.fullName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold">{user.role}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  <div className="font-medium">{user.email}</div>
                  {user.phone && <div className="text-xs">{user.phone}</div>}
                </td>
                <td className="p-4">
                  {user.role === 'rider' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Active</span>
                  ) : user.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12}/> Verified</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={12}/> Pending</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.role === 'driver' && !user.isVerified && (
                      <button onClick={() => handleApprove(user._id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(user._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Remove User">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayUsers.length === 0 && (
               <tr><td colSpan="4" className="p-8 text-center text-slate-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}