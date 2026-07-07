"use client";
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Clock, Eye, Trash2, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import API_BASE_URL from '@/config';

function getStatus(user) {
  if (user.accountStatus === 'suspended') return { label: 'Suspended', tone: 'red', icon: Clock };
  if (user.role === 'rider') return { label: 'Active', tone: 'slate', icon: null };
  if (user.isVerified) return { label: 'Verified', tone: 'green', icon: CheckCircle };
  if (user.licenseUrl) return { label: user.verificationStatus || 'Pending', tone: 'yellow', icon: Clock };
  return { label: 'Incomplete', tone: 'slate', icon: Clock };
}

function StatusBadge({ user }) {
  const status = getStatus(user);
  const Icon = status.icon;
  const tones = {
    green: 'bg-green-50 text-green-700 ring-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${tones[status.tone]}`}>
      {Icon && <Icon size={12} />}
      {status.label}
    </span>
  );
}

function Avatar({ user, size = 44 }) {
  const initial = user.fullName?.charAt(0)?.toUpperCase() || 'U';
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-slate-100 text-center font-black text-slate-600"
      style={{ width: size, height: size, lineHeight: `${size}px` }}
    >
      {user.profilePic ? (
        <Image src={user.profilePic} alt={user.fullName || 'User'} width={size} height={size} className="h-full w-full object-cover" />
      ) : (initial)}
    </div>
  );
}

export default function UserTable({ role, limit, refreshKey = 0, onChanged, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [workingId, setWorkingId] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (limit) params.set('limit', String(limit));
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_BASE_URL}/admin/users${queryString}`, {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!data.success) return [];
      return data.users;
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      return [];
    }
  }, [limit, role]);

  const refreshUsers = useCallback(async () => {
    const nextUsers = await fetchUsers();
    setUsers(nextUsers);
    onChanged?.();
  }, [fetchUsers, onChanged]);

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      setLoading(true);
      const nextUsers = await fetchUsers();
      if (isMounted) {
        setUsers(nextUsers);
        setLoading(false);
      }
    }
    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [fetchUsers, refreshKey]);

  const handleApprove = async (id) => {
    if (!window.confirm("Verify this driver?")) return;
    setWorkingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) await refreshUsers();
    } finally { setWorkingId(''); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name || 'this user'}?`)) return;
    setWorkingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}`, { method: 'DELETE' });
      if (res.ok) await refreshUsers();
    } finally { setWorkingId(''); }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayUsers = users
    .filter((user) => {
      const name = user.fullName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';
      return !normalizedSearch || name.includes(normalizedSearch) || email.includes(normalizedSearch) || phone.includes(normalizedSearch);
    })
    .slice(0, limit || users.length);

  if (loading) return <div className="rounded-3xl bg-white p-8 text-center text-slate-400 shadow-sm">Loading records...</div>;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-4 border-b border-slate-100 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0 sm:p-6">
        <div>
          <h3 className="text-lg font-black capitalize text-slate-900">{role ? `${role}s Directory` : 'Recent Users'}</h3>
          <p className="text-xs font-semibold text-slate-500">{displayUsers.length} shown</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:w-72">
            <Search size={16} className="mr-2 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search name, email, phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button
            onClick={refreshUsers}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh users"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="p-4">Identity</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Driver Details</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayUsers.map((user) => (
              <tr key={user.id} className="transition hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size={40} />
                    <div className="min-w-0">
                      <div className="truncate font-black text-slate-900">{user.fullName || 'Unnamed user'}</div>
                      <div className="text-xs font-black uppercase text-slate-500">{user.role}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  <div className="font-semibold">{user.email || 'No email'}</div>
                  {user.phone && <div className="text-xs">{user.phone}</div>}
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {user.role === 'driver' ? (
                    <div>
                      <div className="font-semibold text-slate-700">{user.vehicle || 'No vehicle'}</div>
                      <div className="text-xs font-black text-slate-500">{user.isAvailable ? 'Online' : 'Offline'}</div>
                    </div>
                  ) : <span className="text-xs font-semibold text-slate-400">Rider</span>}
                </td>
                <td className="p-4"><StatusBadge user={user} /></td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onSelectUser?.(user.id)} className="rounded-xl bg-slate-100 p-2 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"><Eye size={18} /></button>
                    {user.role === 'driver' && !user.isVerified && (
                      <button onClick={() => handleApprove(user.id)} disabled={workingId === user.id} className="rounded-xl bg-green-50 p-2 text-green-700 ring-1 ring-green-100 transition disabled:opacity-50"><CheckCircle size={18} /></button>
                    )}
                    <button onClick={() => handleDelete(user.id, user.fullName)} disabled={workingId === user.id} className="rounded-xl bg-red-50 p-2 text-red-600 ring-1 ring-red-100 transition disabled:opacity-50"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
