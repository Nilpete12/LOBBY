"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bell,
  Car,
  CheckCircle2,
  Clock,
  Menu,
  Phone,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

import UserTable from '@/components/admin/UserTable';
import StatsCard from '@/components/admin/StatsCard';
import AdminLog from '@/components/admin/Adminlog';
import Sidebar from '@/components/admin/Sidebar';
import API_BASE_URL from '@/config';

const EMPTY_STATS = {
  totalUsers: 0,
  totalDrivers: 0,
  activeDrivers: 0,
  pendingDrivers: 0,
  pendingVerificationRequests: 0,
  pendingComplaints: 0,
  totalCalls: 0,
};

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'verifications', label: 'Verify' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'complaints', label: 'Support' },
];

function formatDate(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusPill({ status }) {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    approved: 'bg-green-50 text-green-700 ring-green-100',
    rejected: 'bg-red-50 text-red-700 ring-red-100',
    resolved: 'bg-green-50 text-green-700 ring-green-100',
    superseded: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [workingRequestId, setWorkingRequestId] = useState('');
  const [settings, setSettings] = useState({ maintenance: false, registration: true });
  const [resetState, setResetState] = useState({ status: 'idle', message: '' });
  const [notice, setNotice] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);

  const badges = useMemo(
    () => ({
      verifications: stats.pendingVerificationRequests || 0,
      complaints: stats.pendingComplaints || 0,
    }),
    [stats.pendingComplaints, stats.pendingVerificationRequests]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`);
      const data = await res.json();
      if (data.success) setStats({ ...EMPTY_STATS, ...data.stats });
    } catch (error) {
      console.error("Stats Error", error);
    }
  }, []);

  const loadVerificationRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verification-requests`);
      const data = await res.json();
      if (data.success) setVerificationRequests(data.requests);
    } catch (error) {
      console.error("Verification requests error", error);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints`);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch (error) {
      console.error("Complaints error", error);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    await Promise.all([loadStats(), loadVerificationRequests()]);
  }, [loadStats, loadVerificationRequests]);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/session`);
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadInitialAdminData() {
      await refreshAdminData();
    }

    loadInitialAdminData();
  }, [isAuthenticated, refreshAdminData]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadActiveTabData() {
      if (activeTab === 'complaints') await loadComplaints();
      if (activeTab === 'verifications') await loadVerificationRequests();
    }

    loadActiveTabData();
  }, [activeTab, isAuthenticated, loadComplaints, loadVerificationRequests]);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/admin/logout`, { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/');
  };

  const handleVerificationAction = async (id, action) => {
    const isRejecting = action === 'reject';
    const notes = isRejecting
      ? window.prompt('Reason for rejection? This will be saved for admin records.', 'Document could not be verified.')
      : 'Approved by admin';

    if (notes === null) return;
    if (!isRejecting && !window.confirm('Approve this driver verification?')) return;

    setWorkingRequestId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verification-requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, notes }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification update failed');
      }

      setVerificationRequests((current) =>
        current.map((request) => (request._id === id ? data.request : request))
      );
      setNotice({
        type: 'success',
        message: action === 'approve' ? 'Driver verified.' : 'Verification rejected.',
      });
      await loadStats();
    } catch (error) {
      console.error('Failed to review verification request', error);
      setNotice({ type: 'error', message: 'Could not update verification request.' });
    } finally {
      setWorkingRequestId('');
    }
  };

  const resolveComplaint = async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, { method: 'PUT' });
    if (res.ok) {
      setComplaints((current) =>
        current.map((complaint) =>
          complaint._id === id ? { ...complaint, status: 'resolved' } : complaint
        )
      );
      await loadStats();
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm("Are you sure you want to wipe all analytics data? This cannot be undone.")) return;

    setResetState({ status: 'loading', message: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/reset`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Analytics reset failed');
      }

      setStats((prev) => ({ ...prev, totalCalls: 0 }));
      setResetState({
        status: 'success',
        message: `Deleted ${data.deletedCount || 0} analytics records.`,
      });
    } catch (error) {
      console.error('Failed to reset analytics', error);
      setResetState({
        status: 'error',
        message: 'Analytics data could not be reset. Please try again.',
      });
    }
  };

  if (isCheckingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-sm font-black text-slate-400">Checking access...</div>;
  }

  if (!isAuthenticated) return <AdminLog onLogin={() => setIsAuthenticated(true)} />;

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatsCard title="Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatsCard title="Drivers" value={stats.totalDrivers} icon={Car} color="indigo" />
        <StatsCard title="Pending" value={stats.pendingVerificationRequests} icon={ShieldCheck} trend="Review" color="orange" />
        <StatsCard title="Calls" value={stats.totalCalls} icon={Phone} trend="Leads" color="green" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Verification Queue</h2>
              <p className="text-xs font-semibold text-slate-500">{stats.pendingVerificationRequests} pending requests</p>
            </div>
            <button
              onClick={() => setActiveTab('verifications')}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white"
            >
              Open
            </button>
          </div>
          <VerificationList
            requests={verificationRequests.slice(0, 3)}
            loading={loadingRequests}
            workingRequestId={workingRequestId}
            onReview={handleVerificationAction}
            compact
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Live Drivers</h2>
              <p className="text-xs font-semibold text-slate-500">{stats.activeDrivers} currently online</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <button
            onClick={() => setActiveTab('drivers')}
            className="w-full rounded-2xl bg-green-50 px-4 py-3 text-sm font-black text-green-700 ring-1 ring-green-100"
          >
            Manage Drivers
          </button>
        </section>
      </div>

      <UserTable limit={5} onChanged={refreshAdminData} />
    </div>
  );

  const renderVerifications = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Driver Verification</h2>
          <p className="text-sm font-semibold text-slate-500">{stats.pendingVerificationRequests} pending requests</p>
        </div>
        <button
          onClick={loadVerificationRequests}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <VerificationList
          requests={verificationRequests}
          loading={loadingRequests}
          workingRequestId={workingRequestId}
          onReview={handleVerificationAction}
        />
      </div>
    </section>
  );

  const renderComplaints = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Complaints & Support</h2>
          <p className="text-sm font-semibold text-slate-500">{stats.pendingComplaints} pending messages</p>
        </div>
        <button
          onClick={loadComplaints}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {loadingComplaints ? (
          <div className="p-8 text-center text-slate-400">Loading messages...</div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No support messages yet.</div>
        ) : (
          complaints.map((complaint) => (
            <article key={complaint._id} className="space-y-3 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900">{complaint.name}</h3>
                    <StatusPill status={complaint.status} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-500">
                      {complaint.role}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-500">{complaint.email || 'No email'}</p>
                </div>
                {complaint.status !== 'resolved' && (
                  <button
                    onClick={() => resolveComplaint(complaint._id)}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{complaint.topic}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{complaint.message}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );

  const renderSettings = () => (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-black text-slate-900">Platform Settings</h2>
        <SettingToggle
          title="Maintenance Mode"
          description="Disable the app for all users temporarily."
          enabled={settings.maintenance}
          onClick={() => setSettings((current) => ({ ...current, maintenance: !current.maintenance }))}
        />
        <SettingToggle
          title="Allow New Registrations"
          description="Stop new drivers/riders from signing up."
          enabled={settings.registration}
          onClick={() => setSettings((current) => ({ ...current, registration: !current.registration }))}
        />
      </section>

      <section className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm sm:p-8">
        <h3 className="mb-2 font-black text-red-800">Danger Zone</h3>
        <p className="mb-4 text-sm font-semibold text-red-600">Irreversible system management actions.</p>
        <button
          onClick={handleResetAnalytics}
          disabled={resetState.status === 'loading'}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-200 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetState.status === 'loading' ? 'Resetting...' : 'Reset All Analytics Data'}
        </button>
        {resetState.message && (
          <p className={`mt-3 text-sm font-black ${resetState.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {resetState.message}
          </p>
        )}
      </section>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'riders':
        return <UserTable role="rider" onChanged={refreshAdminData} />;
      case 'drivers':
        return <UserTable role="driver" onChanged={refreshAdminData} />;
      case 'verifications':
        return renderVerifications();
      case 'complaints':
        return renderComplaints();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans md:flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        badges={badges}
      />

      <main className="min-w-0 flex-1 pb-24 md:h-screen md:overflow-y-auto md:pb-8">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur md:static md:border-0 md:px-8 md:py-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl border border-slate-200 bg-white p-2.5 md:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Admin</p>
                <h1 className="truncate text-2xl font-black capitalize text-slate-950 md:text-3xl">
                  {activeTab}
                </h1>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('verifications')}
              className="relative rounded-2xl border border-slate-200 bg-white p-3"
              aria-label="Open verification notifications"
            >
              <Bell size={20} className="text-slate-700" />
              {stats.pendingVerificationRequests > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                  {stats.pendingVerificationRequests}
                </span>
              )}
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
                  activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="px-4 py-5 md:px-8 md:py-0">
          {notice && (
            <div
              className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 text-sm font-black ${
                notice.type === 'success'
                  ? 'border-green-100 bg-green-50 text-green-800'
                  : 'border-red-100 bg-red-50 text-red-800'
              }`}
            >
              {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="flex-1">{notice.message}</span>
              <button onClick={() => setNotice(null)} aria-label="Dismiss notice">
                <XCircle size={18} />
              </button>
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function VerificationList({ requests, loading, workingRequestId, onReview, compact = false }) {
  if (loading) return <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-400">Loading verification requests...</div>;
  if (!requests.length) return <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-400">No verification requests yet.</div>;

  return (
    <div className={compact ? 'space-y-3' : 'grid gap-4 lg:grid-cols-2'}>
      {requests.map((request) => (
        <article key={request._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {request.licenseUrl && (
            <a href={request.licenseUrl} target="_blank" rel="noopener noreferrer" className="block h-44 bg-slate-100">
              <Image
                src={request.licenseUrl}
                alt={`${request.driverName} license`}
                width={640}
                height={360}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </a>
          )}
          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-black text-slate-900">{request.driverName}</h3>
                  <StatusPill status={request.status} />
                </div>
                <p className="mt-1 break-all text-xs font-semibold text-slate-500">{request.email || 'No email'}</p>
                {request.phone && <p className="text-xs font-semibold text-slate-500">{request.phone}</p>}
              </div>
              <div className="rounded-2xl bg-slate-50 p-2 text-slate-500">
                <Clock size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
              <div className="rounded-2xl bg-slate-50 p-3">
                <span className="block font-black text-slate-800">Vehicle</span>
                {request.vehicle || 'Not added'}
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <span className="block font-black text-slate-800">Submitted</span>
                {formatDate(request.createdAt)}
              </div>
            </div>

            {request.reviewNotes && (
              <p className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                {request.reviewNotes}
              </p>
            )}

            {request.status === 'pending' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onReview(request._id, 'approve')}
                  disabled={workingRequestId === request._id}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-600 px-3 py-2 text-sm font-black text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  Approve
                </button>
                <button
                  onClick={() => onReview(request._id, 'reject')}
                  disabled={workingRequestId === request._id}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-black text-red-600 ring-1 ring-red-100 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Reject
                </button>
              </div>
            ) : (
              <a
                href={request.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-700"
              >
                Open License
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function SettingToggle({ title, description, enabled, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <h3 className="font-black text-slate-800">{title}</h3>
        <p className="text-sm font-semibold text-slate-500">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}
        aria-pressed={enabled}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${enabled ? 'right-1' : 'left-1'}`}></span>
      </button>
    </div>
  );
}
