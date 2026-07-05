"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  Ban,
  BarChart3,
  Bell,
  BookOpenCheck,
  Car,
  CheckCircle2,
  Clock,
  Menu,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
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
  suspendedUsers: 0,
  totalCalls: 0,
  bookingStatus: {},
  topDestinations: [],
  recentActivity: [],
};

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationOpen: true,
  bookingOpen: true,
  supportOpen: true,
  notice: '',
};

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'verifications', label: 'Verify' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'complaints', label: 'Support' },
];

const COMPLAINT_STATUSES = ['pending', 'in_review', 'waiting_for_user', 'resolved'];
const BOOKING_STATUSES = ['pending', 'accepted', 'completed', 'cancelled'];
const REJECTION_REASONS = [
  'Blurry or unreadable document',
  'Wrong document uploaded',
  'Expired license',
  'Vehicle details do not match',
  'Missing required information',
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
    accepted: 'bg-blue-50 text-blue-700 ring-blue-100',
    approved: 'bg-green-50 text-green-700 ring-green-100',
    completed: 'bg-green-50 text-green-700 ring-green-100',
    resolved: 'bg-green-50 text-green-700 ring-green-100',
    active: 'bg-green-50 text-green-700 ring-green-100',
    in_review: 'bg-blue-50 text-blue-700 ring-blue-100',
    waiting_for_user: 'bg-purple-50 text-purple-700 ring-purple-100',
    rejected: 'bg-red-50 text-red-700 ring-red-100',
    cancelled: 'bg-red-50 text-red-700 ring-red-100',
    suspended: 'bg-red-50 text-red-700 ring-red-100',
    superseded: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${styles[status] || styles.pending}`}>
      {String(status || 'pending').replaceAll('_', ' ')}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [complaints, setComplaints] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notice, setNotice] = useState(null);
  const [resetState, setResetState] = useState({ status: 'idle', message: '' });
  const [loading, setLoading] = useState({
    complaints: false,
    requests: false,
    bookings: false,
    activity: false,
    detail: false,
  });
  const [workingRequestId, setWorkingRequestId] = useState('');
  const [assignmentByBooking, setAssignmentByBooking] = useState({});
  const [rejectionByRequest, setRejectionByRequest] = useState({});
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailForm, setDetailForm] = useState({});

  const badges = useMemo(
    () => ({
      verifications: stats.pendingVerificationRequests || 0,
      complaints: stats.pendingComplaints || 0,
      bookings: stats.bookingStatus?.pending || 0,
    }),
    [stats.bookingStatus, stats.pendingComplaints, stats.pendingVerificationRequests]
  );

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4500);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`);
      const data = await res.json();
      if (data.success) setStats({ ...EMPTY_STATS, ...data.stats });
    } catch (error) {
      console.error('Stats Error', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`);
      const data = await res.json();
      if (data.success) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    } catch (error) {
      console.error('Settings Error', error);
    }
  }, []);

  const loadVerificationRequests = useCallback(async () => {
    setLoading((current) => ({ ...current, requests: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verification-requests`);
      const data = await res.json();
      if (data.success) setVerificationRequests(data.requests);
    } catch (error) {
      console.error('Verification requests error', error);
    } finally {
      setLoading((current) => ({ ...current, requests: false }));
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoading((current) => ({ ...current, complaints: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints`);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch (error) {
      console.error('Complaints error', error);
    } finally {
      setLoading((current) => ({ ...current, complaints: false }));
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading((current) => ({ ...current, bookings: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setAvailableDrivers(data.availableDrivers || []);
      }
    } catch (error) {
      console.error('Bookings error', error);
    } finally {
      setLoading((current) => ({ ...current, bookings: false }));
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setLoading((current) => ({ ...current, activity: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/activity`);
      const data = await res.json();
      if (data.success) setActivityLogs(data.logs);
    } catch (error) {
      console.error('Activity error', error);
    } finally {
      setLoading((current) => ({ ...current, activity: false }));
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    await Promise.all([loadStats(), loadSettings(), loadVerificationRequests()]);
  }, [loadSettings, loadStats, loadVerificationRequests]);

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
      await Promise.all([refreshAdminData(), loadActivity()]);
    }

    loadInitialAdminData();
  }, [isAuthenticated, loadActivity, refreshAdminData]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadActiveTabData() {
      if (activeTab === 'complaints') await loadComplaints();
      if (activeTab === 'verifications') await loadVerificationRequests();
      if (activeTab === 'bookings') await loadBookings();
      if (activeTab === 'activity') await loadActivity();
      if (activeTab === 'settings') await loadSettings();
    }

    loadActiveTabData();
  }, [
    activeTab,
    isAuthenticated,
    loadActivity,
    loadBookings,
    loadComplaints,
    loadSettings,
    loadVerificationRequests,
  ]);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/admin/logout`, { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/');
  };

  const updateSettings = async (updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Settings update failed');
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      showNotice('success', 'Settings saved.');
      await loadActivity();
    } catch (error) {
      console.error('Failed to update settings', error);
      showNotice('error', 'Could not save settings.');
    }
  };

  const openUserDetail = async (id) => {
    setLoading((current) => ({ ...current, detail: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'User lookup failed');
      setSelectedUserDetail(data);
      setDetailForm({
        fullName: data.user.fullName || '',
        phone: data.user.phone || '',
        vehicle: data.user.vehicle || '',
        routes: Array.isArray(data.user.routes) ? data.user.routes.join(', ') : '',
        rating: data.user.rating || 5,
        aiNotes: data.user.aiNotes || '',
      });
    } catch (error) {
      console.error('Failed to load user detail', error);
      showNotice('error', 'Could not load user profile.');
    } finally {
      setLoading((current) => ({ ...current, detail: false }));
    }
  };

  const saveUserDetail = async () => {
    if (!selectedUserDetail?.user?._id) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUserDetail.user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          ...detailForm,
          rating: Number(detailForm.rating) || 5,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Profile update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', 'Profile updated.');
      await Promise.all([loadStats(), loadActivity()]);
    } catch (error) {
      console.error('Failed to save user detail', error);
      showNotice('error', 'Could not update profile.');
    }
  };

  const setUserSuspension = async (action) => {
    if (!selectedUserDetail?.user?._id) return;
    const reason =
      action === 'suspend'
        ? window.prompt('Reason for suspension?', selectedUserDetail.user.suspensionReason || 'Policy review required')
        : '';

    if (action === 'suspend' && reason === null) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUserDetail.user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Account update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', action === 'suspend' ? 'User suspended.' : 'User unsuspended.');
      await Promise.all([loadStats(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update suspension state', error);
      showNotice('error', 'Could not update account status.');
    }
  };

  const handleVerificationAction = async (id, action, reason = '') => {
    if (action === 'approve' && !window.confirm('Approve this driver verification?')) return;

    setWorkingRequestId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verification-requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          notes: action === 'reject' ? reason || REJECTION_REASONS[0] : 'Approved by admin',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Verification update failed');

      setVerificationRequests((current) =>
        current.map((request) => (request._id === id ? data.request : request))
      );
      showNotice('success', action === 'approve' ? 'Driver verified.' : 'Verification rejected.');
      await Promise.all([loadStats(), loadActivity()]);
    } catch (error) {
      console.error('Failed to review verification request', error);
      showNotice('error', 'Could not update verification request.');
    } finally {
      setWorkingRequestId('');
    }
  };

  const updateComplaint = async (id, status) => {
    const note = window.prompt('Internal note for this ticket? Leave blank if not needed.', '');
    if (note === null) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Ticket update failed');
      setComplaints((current) =>
        current.map((complaint) => (complaint._id === id ? data.complaint : complaint))
      );
      await Promise.all([loadStats(), loadActivity()]);
      showNotice('success', 'Support ticket updated.');
    } catch (error) {
      console.error('Failed to update complaint', error);
      showNotice('error', 'Could not update support ticket.');
    }
  };

  const updateBooking = async (booking, status) => {
    const selectedDriverId = assignmentByBooking[booking._id] || booking.driverId || '';

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking._id,
          status,
          driverId: status === 'accepted' ? selectedDriverId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Booking update failed');
      setBookings((current) =>
        current.map((item) => (item._id === booking._id ? data.booking : item))
      );
      showNotice('success', status === 'accepted' ? 'Booking assigned.' : 'Booking updated.');
      await Promise.all([loadStats(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update booking', error);
      showNotice('error', error.message || 'Could not update booking.');
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('Are you sure you want to wipe all analytics data? This cannot be undone.')) return;

    setResetState({ status: 'loading', message: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/reset`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Analytics reset failed');

      setStats((prev) => ({ ...prev, totalCalls: 0 }));
      setResetState({
        status: 'success',
        message: `Deleted ${data.deletedCount || 0} analytics records.`,
      });
      await loadActivity();
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
          <SectionHeader
            title="Verification Queue"
            subtitle={`${stats.pendingVerificationRequests} pending requests`}
            actionLabel="Open"
            onAction={() => setActiveTab('verifications')}
          />
          <VerificationList
            requests={verificationRequests.slice(0, 3)}
            loading={loading.requests}
            workingRequestId={workingRequestId}
            rejectionByRequest={rejectionByRequest}
            setRejectionByRequest={setRejectionByRequest}
            onReview={handleVerificationAction}
            compact
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader title="Operations" subtitle={`${stats.activeDrivers} drivers online`} />
          <div className="grid gap-3">
            <QuickAction icon={BookOpenCheck} label={`${stats.bookingStatus?.pending || 0} pending bookings`} onClick={() => setActiveTab('bookings')} />
            <QuickAction icon={Ban} label={`${stats.suspendedUsers || 0} suspended users`} onClick={() => setActiveTab('riders')} />
            <QuickAction icon={Activity} label="View activity log" onClick={() => setActiveTab('activity')} />
          </div>
        </section>
      </div>

      <UserTable limit={5} onChanged={refreshAdminData} onSelectUser={openUserDetail} />
    </div>
  );

  const renderVerifications = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionShell
        title="Driver Verification"
        subtitle={`${stats.pendingVerificationRequests} pending requests`}
        onRefresh={loadVerificationRequests}
      >
        <VerificationList
          requests={verificationRequests}
          loading={loading.requests}
          workingRequestId={workingRequestId}
          rejectionByRequest={rejectionByRequest}
          setRejectionByRequest={setRejectionByRequest}
          onReview={handleVerificationAction}
        />
      </SectionShell>
    </section>
  );

  const renderBookings = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionShell title="Booking Oversight" subtitle="Assign drivers and update ride states" onRefresh={loadBookings}>
        {loading.bookings ? (
          <EmptyState label="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState label="No bookings yet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                drivers={availableDrivers}
                selectedDriver={assignmentByBooking[booking._id] || booking.driverId || ''}
                onSelectDriver={(driverId) =>
                  setAssignmentByBooking((current) => ({ ...current, [booking._id]: driverId }))
                }
                onUpdate={(status) => updateBooking(booking, status)}
              />
            ))}
          </div>
        )}
      </SectionShell>
    </section>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatsCard title="Pending" value={stats.bookingStatus?.pending || 0} icon={Clock} color="orange" />
        <StatsCard title="Accepted" value={stats.bookingStatus?.accepted || 0} icon={BookOpenCheck} color="blue" />
        <StatsCard title="Completed" value={stats.bookingStatus?.completed || 0} icon={CheckCircle2} color="green" />
        <StatsCard title="Cancelled" value={stats.bookingStatus?.cancelled || 0} icon={XCircle} color="indigo" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <SectionHeader title="Top Destinations" subtitle="Based on instant booking requests" />
        <div className="mt-4 space-y-3">
          {stats.topDestinations?.length ? (
            stats.topDestinations.map((item) => (
              <div key={item.destination} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-black text-slate-800">{item.destination}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{item.count}</span>
              </div>
            ))
          ) : (
            <EmptyState label="No destination data yet." />
          )}
        </div>
      </section>
    </div>
  );

  const renderComplaints = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionShell title="Complaints & Support" subtitle={`${stats.pendingComplaints} active tickets`} onRefresh={loadComplaints}>
        {loading.complaints ? (
          <EmptyState label="Loading messages..." />
        ) : complaints.length === 0 ? (
          <EmptyState label="No support messages yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <SupportTicket key={complaint._id} complaint={complaint} onUpdate={updateComplaint} />
            ))}
          </div>
        )}
      </SectionShell>
    </section>
  );

  const renderSettings = () => (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-black text-slate-900">Platform Settings</h2>
        <SettingToggle
          title="Maintenance Mode"
          description="Show a maintenance screen and block new operational actions."
          enabled={settings.maintenanceMode}
          onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
        />
        <SettingToggle
          title="Allow New Registrations"
          description="Controls onboarding for brand-new users."
          enabled={settings.registrationOpen}
          onClick={() => updateSettings({ registrationOpen: !settings.registrationOpen })}
        />
        <SettingToggle
          title="Allow Instant Bookings"
          description="Controls rider instant booking requests."
          enabled={settings.bookingOpen}
          onClick={() => updateSettings({ bookingOpen: !settings.bookingOpen })}
        />
        <SettingToggle
          title="Allow Support Messages"
          description="Controls new support form submissions."
          enabled={settings.supportOpen}
          onClick={() => updateSettings({ supportOpen: !settings.supportOpen })}
        />

        <div className="mt-6">
          <label className="mb-2 block text-xs font-black uppercase text-slate-500">Maintenance Notice</label>
          <textarea
            value={settings.notice || ''}
            onChange={(event) => setSettings((current) => ({ ...current, notice: event.target.value }))}
            className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
            placeholder="Optional message shown during maintenance mode"
          />
          <button
            onClick={() => updateSettings({ notice: settings.notice || '' })}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            <Save size={16} />
            Save Notice
          </button>
        </div>
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

  const renderActivity = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionShell title="Admin Activity Log" subtitle="Recent operational changes" onRefresh={loadActivity}>
        <ActivityFeed logs={activityLogs} loading={loading.activity} />
      </SectionShell>
    </section>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'riders':
        return <UserTable role="rider" onChanged={refreshAdminData} onSelectUser={openUserDetail} />;
      case 'drivers':
        return <UserTable role="driver" onChanged={refreshAdminData} onSelectUser={openUserDetail} />;
      case 'verifications':
        return renderVerifications();
      case 'bookings':
        return renderBookings();
      case 'analytics':
        return renderAnalytics();
      case 'complaints':
        return renderComplaints();
      case 'activity':
        return renderActivity();
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

      {selectedUserDetail && (
        <UserDetailDrawer
          detail={selectedUserDetail}
          form={detailForm}
          setForm={setDetailForm}
          loading={loading.detail}
          onClose={() => setSelectedUserDetail(null)}
          onSave={saveUserDetail}
          onSuspend={() => setUserSuspension('suspend')}
          onUnsuspend={() => setUserSuspension('unsuspend')}
        />
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs font-semibold text-slate-500">{subtitle}</p>}
      </div>
      {actionLabel && (
        <button onClick={onAction} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function SectionShell({ title, subtitle, onRefresh, children }) {
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm font-semibold text-slate-500">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </>
  );
}

function EmptyState({ label }) {
  return <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">{label}</div>;
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-left text-sm font-black text-slate-700 ring-1 ring-slate-100"
    >
      <span>{label}</span>
      <Icon size={18} className="text-slate-400" />
    </button>
  );
}

function VerificationList({
  requests,
  loading,
  workingRequestId,
  rejectionByRequest,
  setRejectionByRequest,
  onReview,
  compact = false,
}) {
  if (loading) return <EmptyState label="Loading verification requests..." />;
  if (!requests.length) return <EmptyState label="No verification requests yet." />;

  return (
    <div className={compact ? 'space-y-3' : 'grid gap-4 lg:grid-cols-2'}>
      {requests.map((request) => {
        const rejectionReason = rejectionByRequest[request._id] || REJECTION_REASONS[0];
        return (
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
                <Clock size={18} className="text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                <InfoBlock label="Vehicle" value={request.vehicle || 'Not added'} />
                <InfoBlock label="Submitted" value={formatDate(request.createdAt)} />
              </div>

              {request.reviewNotes && (
                <p className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{request.reviewNotes}</p>
              )}

              {request.status === 'pending' ? (
                <div className="space-y-2">
                  <select
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionByRequest((current) => ({ ...current, [request._id]: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700"
                  >
                    {REJECTION_REASONS.map((reason) => (
                      <option key={reason}>{reason}</option>
                    ))}
                  </select>
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
                      onClick={() => onReview(request._id, 'reject', rejectionReason)}
                      disabled={workingRequestId === request._id}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-black text-red-600 ring-1 ring-red-100 disabled:opacity-50"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>
                  </div>
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
        );
      })}
    </div>
  );
}

function BookingCard({ booking, drivers, selectedDriver, onSelectDriver, onUpdate }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-slate-900">{booking.riderName}</h3>
            <StatusPill status={booking.status} />
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(booking.createdAt)}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{booking.riderPhone}</span>
      </div>

      <div className="grid gap-2 text-sm text-slate-600">
        <InfoBlock label="Destination" value={booking.destination} />
        <InfoBlock label="Pickup" value={booking.pickupLocation?.address || 'Current Location'} />
        <InfoBlock label="Driver" value={booking.driver?.fullName || 'Unassigned'} />
      </div>

      <div className="mt-4 space-y-2">
        <select
          value={selectedDriver}
          onChange={(event) => onSelectDriver(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700"
        >
          <option value="">Select verified driver</option>
          {drivers.map((driver) => (
            <option key={driver.clerkId} value={driver.clerkId}>
              {driver.fullName} {driver.isAvailable ? '(online)' : '(offline)'}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate('accepted')}
            className="rounded-2xl bg-blue-600 px-3 py-3 text-sm font-black text-white"
          >
            Assign
          </button>
          <button
            onClick={() => onUpdate('completed')}
            className="rounded-2xl bg-green-50 px-3 py-3 text-sm font-black text-green-700 ring-1 ring-green-100"
          >
            Complete
          </button>
          <button
            onClick={() => onUpdate('pending')}
            className="rounded-2xl bg-slate-100 px-3 py-3 text-sm font-black text-slate-700"
          >
            Reopen
          </button>
          <button
            onClick={() => onUpdate('cancelled')}
            className="rounded-2xl bg-red-50 px-3 py-3 text-sm font-black text-red-600 ring-1 ring-red-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </article>
  );
}

function SupportTicket({ complaint, onUpdate }) {
  return (
    <article className="space-y-3 p-4 sm:p-6">
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
        <select
          value={complaint.status}
          onChange={(event) => onUpdate(complaint._id, event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700"
        >
          {COMPLAINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-sm font-black text-slate-800">{complaint.topic}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{complaint.message}</p>
      </div>
      {complaint.internalNotes?.length > 0 && (
        <div className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
          Latest note: {complaint.internalNotes[complaint.internalNotes.length - 1]?.note}
        </div>
      )}
    </article>
  );
}

function ActivityFeed({ logs, loading }) {
  if (loading) return <EmptyState label="Loading activity..." />;
  if (!logs.length) return <EmptyState label="No admin activity yet." />;

  return (
    <div className="divide-y divide-slate-100">
      {logs.map((log) => (
        <article key={log._id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-900">{log.summary}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {log.actor} · {log.action}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-400">{formatDate(log.createdAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function UserDetailDrawer({ detail, form, setForm, loading, onClose, onSave, onSuspend, onUnsuspend }) {
  const user = detail.user;
  const isSuspended = user.accountStatus === 'suspended';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center sm:p-4" onClick={onClose}>
      <section
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{user.fullName}</h2>
              <StatusPill status={isSuspended ? 'suspended' : 'active'} />
            </div>
            <p className="break-all text-xs font-semibold text-slate-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 p-4">
              <h3 className="mb-4 font-black text-slate-900">Edit Profile</h3>
              <div className="grid gap-3">
                <AdminInput label="Name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
                <AdminInput label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                {user.role === 'driver' && (
                  <>
                    <AdminInput label="Vehicle" value={form.vehicle} onChange={(value) => setForm((current) => ({ ...current, vehicle: value }))} />
                    <AdminInput label="Routes" value={form.routes} onChange={(value) => setForm((current) => ({ ...current, routes: value }))} />
                    <AdminInput label="Rating" value={String(form.rating)} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
                    <AdminInput label="Admin Notes" value={form.aiNotes} onChange={(value) => setForm((current) => ({ ...current, aiNotes: value }))} />
                  </>
                )}
              </div>
              <button
                onClick={onSave}
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                <Save size={16} />
                Save Changes
              </button>
            </section>

            <section className="rounded-3xl border border-red-100 bg-red-50 p-4">
              <h3 className="font-black text-red-800">Account Control</h3>
              <p className="mt-1 text-sm font-semibold text-red-600">
                Suspension hides drivers from search and blocks operational actions.
              </p>
              {isSuspended && user.suspensionReason && (
                <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-semibold text-red-700">{user.suspensionReason}</p>
              )}
              <button
                onClick={isSuspended ? onUnsuspend : onSuspend}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-200"
              >
                {isSuspended ? <RotateCcw size={16} /> : <Ban size={16} />}
                {isSuspended ? 'Unsuspend User' : 'Suspend User'}
              </button>
            </section>
          </div>

          <aside className="space-y-4">
            {user.role === 'driver' && (
              <section className="rounded-3xl border border-slate-200 p-4">
                <h3 className="mb-3 font-black text-slate-900">Driver Documents</h3>
                <div className="grid gap-3">
                  <ImagePreview label="Profile" src={user.profilePic} />
                  <ImagePreview label="Vehicle" src={user.carPic} />
                  <ImagePreview label="License" src={user.licenseUrl} />
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 p-4">
              <h3 className="mb-3 font-black text-slate-900">Verification History</h3>
              <MiniList
                empty="No verification requests."
                items={detail.verificationRequests}
                render={(request) => (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={request.status} />
                      <span className="text-xs font-semibold text-slate-400">{formatDate(request.createdAt)}</span>
                    </div>
                    {request.reviewNotes && <p className="mt-1 text-xs font-semibold text-slate-500">{request.reviewNotes}</p>}
                  </div>
                )}
              />
            </section>

            <section className="rounded-3xl border border-slate-200 p-4">
              <h3 className="mb-3 font-black text-slate-900">Recent Bookings</h3>
              <MiniList
                empty="No bookings yet."
                items={detail.bookings}
                render={(booking) => (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-slate-800">{booking.destination}</span>
                      <StatusPill status={booking.status} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(booking.createdAt)}</p>
                  </div>
                )}
              />
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function AdminInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function ImagePreview({ label, src }) {
  if (!src) {
    return <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-400">{label}: not uploaded</div>;
  }

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl bg-slate-100">
      <div className="relative h-32">
        <Image src={src} alt={label} fill sizes="280px" className="object-cover" />
      </div>
      <div className="bg-white p-2 text-xs font-black text-slate-600">{label}</div>
    </a>
  );
}

function MiniList({ items, empty, render }) {
  if (!items?.length) return <EmptyState label={empty} />;

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <div key={item._id} className="rounded-2xl bg-slate-50 p-3">
          {render(item)}
        </div>
      ))}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <span className="block text-xs font-black uppercase text-slate-400">{label}</span>
      <span className="text-sm font-black text-slate-800">{value}</span>
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
