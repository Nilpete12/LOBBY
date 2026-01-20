import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RecentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users on Load
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Approve Click
  const handleApprove = async (id) => {
    const confirm = window.confirm("Are you sure you want to verify this driver?");
    if (!confirm) return;

    await fetch('http://localhost:5000/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    fetchUsers(); // Refresh the table
  };

  if (loading) return <div className="p-6 text-center text-slate-400">Loading Drivers...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-900">Driver Applications</h3>
        <span className="text-sm text-slate-400">{users.length} Total</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-900">{user.fullName}</td>
                <td className="p-4 text-sm text-slate-500">{user.email}</td>
                <td className="p-4">
                  {user.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {!user.isVerified && (
                    <button 
                      onClick={() => handleApprove(user._id)}
                      className="text-xs font-bold bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}