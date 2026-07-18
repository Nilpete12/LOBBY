"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Activity, AlertCircle, Ban, Bell, BookOpenCheck, Car, CheckCircle2, Clock, 
  CreditCard, Eye, Flag, Menu, MessageCircle, Phone, RefreshCw, RotateCcw, 
  Download, Save, Search, ShieldCheck, ToggleRight, Users, X, XCircle,
} from 'lucide-react';

import UserTable from '@/components/admin/UserTable';
import StatsCard from '@/components/admin/StatsCard';
import AdminLog from '@/components/admin/Adminlog';
import Sidebar from '@/components/admin/Sidebar';
import API_BASE_URL from '@/config';
import { TAXI_STANDS } from '@/lib/taxiStands';
import { VEHICLE_TYPES, vehicleTypeLabel } from '@/lib/vehicleTypes';
import { getDriverReadiness } from '@/lib/driverReadiness';

const EMPTY_STATS = {
  totalUsers: 0,
  totalDrivers: 0,
  activeDrivers: 0,
  pendingDrivers: 0,
  pendingVerificationRequests: 0,
  pendingComplaints: 0,
  suspendedUsers: 0,
  paidSubscriptions: 0,
  activeDriverReports: 0,
  totalCalls: 0,
  totalProfileViews: 0,
  totalWhatsAppClicks: 0,
  totalSearches: 0,
  reportedCompletedRides: 0,
  riderConfirmedRides: 0,
  bookingStatus: {},
  topDestinations: [],
  recentActivity: [],
  pilotReadiness: {
    driversReady: 0,
    verifiedDrivers: 0,
    pendingDocuments: 0,
    ridersRegistered: 0,
    openComplaints: 0,
    brokenProfiles: 0,
    withoutPhone: 0,
    withoutPlate: 0,
    withoutStand: 0,
    readinessPercent: 0,
    blockers: [],
    driverIssues: [],
  },
};

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationOpen: true,
  bookingOpen: true,
  supportOpen: true,
  notice: '',
};

const ADMIN_GET_OPTIONS = {
  cache: 'no-store',
  credentials: 'same-origin',
};

async function requestAdminSession(signal) {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), 10000);
  const abortSessionRequest = () => timeoutController.abort();

  signal?.addEventListener('abort', abortSessionRequest, { once: true });

  try {
    const res = await fetch(`${API_BASE_URL}/admin/session`, {
      ...ADMIN_GET_OPTIONS,
      signal: timeoutController.signal,
    });
    const data = await res.json();
    return Boolean(res.ok && data.authenticated);
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortSessionRequest);
  }
}

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'verifications', label: 'Verify' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'riders', label: 'Riders' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'complaints', label: 'Support' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
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

function formatVehiclePlateInput(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 -]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

function StatusPill({ status }) {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    accepted: 'bg-[#EAF4FF] text-[#2F80ED] ring-[#CFE4FF]',
    approved: 'bg-green-50 text-green-700 ring-green-100',
    completed: 'bg-green-50 text-green-700 ring-green-100',
    resolved: 'bg-green-50 text-green-700 ring-green-100',
    active: 'bg-green-50 text-green-700 ring-green-100',
    in_review: 'bg-[#EAF4FF] text-[#2F80ED] ring-[#CFE4FF]',
    waiting_for_user: 'bg-[#FFE4DF] text-[#FF6B6B] ring-[#FFE4DF]',
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
  const [syncState, setSyncState] = useState({ status: 'idle', message: '' });
  const [subscriptionReminderState, setSubscriptionReminderState] = useState({
    status: 'idle',
    message: '',
    links: [],
    skippedWhatsappCount: 0,
  });
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
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
  const [profileSaveState, setProfileSaveState] = useState({ status: 'idle', message: '' });
  const [isExitPromptOpen, setExitPromptOpen] = useState(false);
  const isLoggingOutRef = useRef(false);

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

  useEffect(() => {
    if (!['success', 'error'].includes(profileSaveState.status)) return undefined;

    const timeoutId = window.setTimeout(() => {
      setProfileSaveState({ status: 'idle', message: '' });
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [profileSaveState.status]);

  const loadStats = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) setStats({ ...EMPTY_STATS, ...data.stats });
    } catch (error) {
      console.error('Stats Error', error);
    }
  }, []);

  const loadSettings = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (error) {
      console.error('Settings Error', error);
    }
  }, []);

  const loadVerificationRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading((current) => ({ ...current, requests: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verification-requests`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) setVerificationRequests(data.requests);
    } catch (error) {
      console.error('Verification requests error', error);
    } finally {
      if (!silent) setLoading((current) => ({ ...current, requests: false }));
    }
  }, []);

  const loadComplaints = useCallback(async (silent = false) => {
    if (!silent) setLoading((current) => ({ ...current, complaints: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/complaints`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch (error) {
      console.error('Complaints error', error);
    } finally {
      if (!silent) setLoading((current) => ({ ...current, complaints: false }));
    }
  }, []);

  const loadBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading((current) => ({ ...current, bookings: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setAvailableDrivers(data.availableDrivers || []);
      }
    } catch (error) {
      console.error('Bookings error', error);
    } finally {
      if (!silent) setLoading((current) => ({ ...current, bookings: false }));
    }
  }, []);

  const loadActivity = useCallback(async (silent = false) => {
    if (!silent) setLoading((current) => ({ ...current, activity: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/activity`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (data.success) setActivityLogs(data.logs);
    } catch (error) {
      console.error('Activity error', error);
    } finally {
      if (!silent) setLoading((current) => ({ ...current, activity: false }));
    }
  }, []);

  const refreshAdminData = useCallback(async (silent = false) => {
    await Promise.all([loadStats(silent), loadSettings(), loadVerificationRequests(silent)]);
  }, [loadSettings, loadStats, loadVerificationRequests]);

  const refreshUserTables = useCallback(() => {
    setUsersRefreshKey((current) => current + 1);
  }, []);

  const refreshAdminWorkspace = useCallback(async () => {
    refreshUserTables();
    await Promise.all([
      refreshAdminData(),
      loadActivity(),
      loadComplaints(),
      loadBookings(),
    ]);
  }, [loadActivity, loadBookings, loadComplaints, refreshAdminData, refreshUserTables]);

  const syncAndRefreshAdminWorkspace = useCallback(async () => {
    if (syncState.status === 'loading') return;

    setSyncState({
      status: 'loading',
      message: 'Syncing Clerk users and refreshing admin data...',
    });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/sync-clerk-users`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'User sync failed');

      await refreshAdminWorkspace();

      const message = `Synced ${data.total || 0} Clerk users and refreshed admin data.`;
      setSyncState({
        status: 'success',
        message: `${message} ${data.created || 0} new.`,
      });
      showNotice('success', message);
    } catch (error) {
      console.error('Failed to sync and refresh admin data', error);

      try {
        await refreshAdminWorkspace();
        setSyncState({
          status: 'error',
          message: 'Could not sync Clerk users, but admin data was refreshed.',
        });
        showNotice('error', 'Could not sync Clerk users, but admin data was refreshed.');
      } catch (refreshError) {
        console.error('Fallback admin refresh failed', refreshError);
        setSyncState({
          status: 'error',
          message: 'Could not sync Clerk users or refresh admin data.',
        });
        showNotice('error', 'Could not sync Clerk users or refresh admin data.');
      }
    }
  }, [refreshAdminWorkspace, showNotice, syncState.status]);

  const sendSubscriptionReminders = useCallback(async () => {
    if (subscriptionReminderState.status === 'loading') return;

    setSubscriptionReminderState({
      status: 'loading',
      message: 'Creating dashboard reminders and preparing WhatsApp chats...',
      links: [],
      skippedWhatsappCount: 0,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/subscription-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Subscription reminder failed');

      const links = Array.isArray(data.whatsAppLinks) ? data.whatsAppLinks : [];
      const message = data.targetedCount > 0
        ? `${data.message} ${links.length} WhatsApp chat${links.length === 1 ? '' : 's'} ready.`
        : data.message;

      setSubscriptionReminderState({
        status: 'success',
        message,
        links,
        skippedWhatsappCount: data.skippedWhatsappCount || 0,
      });
      showNotice('success', message);
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to send subscription reminders', error);
      const message = error.message || 'Could not send subscription reminders.';
      setSubscriptionReminderState({
        status: 'error',
        message,
        links: [],
        skippedWhatsappCount: 0,
      });
      showNotice('error', message);
    }
  }, [loadActivity, refreshAdminData, showNotice, subscriptionReminderState.status]);

  useEffect(() => {
    const controller = new AbortController();

    requestAdminSession(controller.signal).then((authenticated) => {
      if (controller.signal.aborted) return;
      setIsAuthenticated(authenticated);
      setIsCheckingAuth(false);
    });

    return () => controller.abort();
  }, []);

  const handleAdminLogin = useCallback(async () => {
    isLoggingOutRef.current = false;
    const authenticated = await requestAdminSession();
    setIsAuthenticated(authenticated);
    return authenticated;
  }, []);

  const clearAdminSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        keepalive: true,
      });
      return response.ok;
    } catch (error) {
      console.error('Admin logout failed', error);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    isLoggingOutRef.current = true;
    const loggedOut = await clearAdminSession();
    if (!loggedOut) {
      isLoggingOutRef.current = false;
      setExitPromptOpen(false);
      showNotice('error', 'Could not log out. Please try again.');
      return;
    }

    setExitPromptOpen(false);
    setIsAuthenticated(false);
    router.replace('/');
  }, [clearAdminSession, router, showNotice]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const buildGuardState = () => ({
      ...(window.history.state || {}),
      lobbyAdminExitGuard: true,
    });

    window.history.pushState(buildGuardState(), '', window.location.href);

    const handleAdminBackNavigation = () => {
      if (isLoggingOutRef.current) return;
      window.history.pushState(buildGuardState(), '', window.location.href);
      setExitPromptOpen(true);
    };

    window.addEventListener('popstate', handleAdminBackNavigation);
    return () => window.removeEventListener('popstate', handleAdminBackNavigation);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const verifyRestoredAdminSession = async (event) => {
      if (!event.persisted) return;
      const authenticated = await requestAdminSession();
      setIsAuthenticated(authenticated);
      if (!authenticated) setExitPromptOpen(false);
    };

    window.addEventListener('pageshow', verifyRestoredAdminSession);
    return () => window.removeEventListener('pageshow', verifyRestoredAdminSession);
  }, [isAuthenticated]);

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
  }, [activeTab, isAuthenticated, loadActivity, loadBookings, loadComplaints, loadSettings, loadVerificationRequests]);

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
      const res = await fetch(`${API_BASE_URL}/admin/user/${id}`, ADMIN_GET_OPTIONS);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'User lookup failed');
      setSelectedUserDetail(data);
      setProfileSaveState({ status: 'idle', message: '' });
      setDetailForm({
        fullName: data.user.fullName || '',
        phone: data.user.phone || '',
        vehicle: data.user.vehicle || '',
        vehicleType: data.user.vehicleType || '',
        vehiclePlate: data.user.vehiclePlate || '',
        routes: Array.isArray(data.user.routes) ? data.user.routes.join(', ') : '',
        taxiStands: Array.isArray(data.user.taxiStands) ? data.user.taxiStands.join(', ') : '',
        currentStand: data.user.currentStand || '',
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
    const user = selectedUserDetail?.user;
    const identifier = user?.clerkId || user?.id;
    if (!identifier) return;
    if (profileSaveState.status === 'saving') return;

    const payload = {
      action: 'update',
      fullName: detailForm.fullName,
      phone: detailForm.phone,
    };

    if (user.role === 'driver') {
      Object.assign(payload, {
        vehicle: detailForm.vehicle,
        vehicleType: detailForm.vehicleType,
        vehiclePlate: detailForm.vehiclePlate,
        routes: detailForm.routes,
        taxiStands: detailForm.taxiStands,
        currentStand: detailForm.currentStand,
        rating: Number(detailForm.rating) || 5,
        aiNotes: detailForm.aiNotes,
      });
    }

    setProfileSaveState({ status: 'saving', message: 'Saving profile changes...' });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Profile update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      setProfileSaveState({ status: 'success', message: 'Changes updated successfully.' });
      showNotice('success', 'Changes updated successfully.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to save user detail', error);
      setProfileSaveState({ status: 'error', message: 'Changes were not updated. Please try again.' });
      showNotice('error', 'Changes were not updated. Please try again.');
    }
  };

  const setUserSuspension = async (action) => {
    const identifier = selectedUserDetail?.user?.clerkId || selectedUserDetail?.user?.id;
    if (!identifier) return;
    const reason = action === 'suspend'
      ? window.prompt('Reason for suspension?', selectedUserDetail.user.suspensionReason || 'Policy review required')
      : '';

    if (action === 'suspend' && reason === null) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Account update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', action === 'suspend' ? 'User suspended.' : 'User unsuspended.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update suspension state', error);
      showNotice('error', 'Could not update account status.');
    }
  };

  const setDriverAvailability = async (isAvailable) => {
    const identifier = selectedUserDetail?.user?.clerkId || selectedUserDetail?.user?.id;
    if (!identifier) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_availability', isAvailable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Availability update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', isAvailable ? 'Driver marked online.' : 'Driver marked offline.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update driver availability', error);
      showNotice('error', error.message || 'Could not update driver availability.');
    }
  };

  const setDriverSubscription = async (action) => {
    const identifier = selectedUserDetail?.user?.clerkId || selectedUserDetail?.user?.id;
    if (!identifier) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, months: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Subscription update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', action === 'mark_subscription_paid' ? 'Subscription marked paid.' : 'Subscription marked unpaid.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update driver subscription', error);
      showNotice('error', error.message || 'Could not update subscription.');
    }
  };

  const setUserRole = async (role) => {
    if (!selectedUserDetail?.user?._id || selectedUserDetail.user.role === role) return;
    if (!window.confirm(`Change this account to ${role}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${selectedUserDetail.user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_role', role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Role update failed');
      setSelectedUserDetail((current) => ({ ...current, user: data.user }));
      showNotice('success', `Account changed to ${role}.`);
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update user role', error);
      showNotice('error', error.message || 'Could not update user role.');
    }
  };

  const deleteSelectedUser = async () => {
    if (!selectedUserDetail?.user?._id) return;
    const user = selectedUserDetail.user;
    if (!window.confirm(`Permanently delete ${user.fullName || 'this user'} from Clerk and the dashboard?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/user/${user._id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || 'Delete failed');

      setSelectedUserDetail(null);
      showNotice('success', 'User deleted.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to delete user', error);
      showNotice('error', error.message || 'Could not delete user.');
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
          id, // Sending the standard id payload
          action,
          notes: action === 'reject' ? reason || REJECTION_REASONS[0] : 'Approved by admin',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Verification update failed');

      // FIX: Maps over request.id instead of request._id
      setVerificationRequests((current) =>
        current.map((request) => (request.id === id ? data.request : request))
      );
      showNotice('success', action === 'approve' ? 'Driver verified.' : 'Verification rejected.');
      refreshUserTables();
      await Promise.all([refreshAdminData(), loadActivity()]);
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
      
      // FIX: Maps over complaint.id instead of complaint._id
      setComplaints((current) =>
        current.map((complaint) => (complaint.id === id ? data.complaint : complaint))
      );
      await Promise.all([refreshAdminData(), loadActivity()]);
      showNotice('success', 'Support ticket updated.');
    } catch (error) {
      console.error('Failed to update complaint', error);
      showNotice('error', 'Could not update support ticket.');
    }
  };

  const updateBooking = async (booking, status) => {
    // FIX: Using booking.id
    const selectedDriverId = assignmentByBooking[booking.id] || booking.driverId || '';

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id, // FIX: Send standard ID to backend
          status,
          driverId: status === 'accepted' ? selectedDriverId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Booking update failed');
      
      // FIX: Mapping standard id instead of _id
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? data.booking : item))
      );
      showNotice('success', status === 'accepted' ? 'Booking assigned.' : 'Booking updated.');
      await Promise.all([refreshAdminData(), loadActivity()]);
    } catch (error) {
      console.error('Failed to update booking', error);
      showNotice('error', error.message || 'Could not update booking.');
    }
  };

  const downloadExport = useCallback((type) => {
    const anchor = document.createElement('a');
    anchor.href = `${API_BASE_URL}/admin/export?type=${encodeURIComponent(type)}`;
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showNotice('success', 'Export started.');
  }, [showNotice]);

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
    return <div className="lobby-command-gradient flex min-h-screen items-center justify-center text-sm font-black text-white/70">Checking access...</div>;
  }

  if (!isAuthenticated) return <AdminLog onLogin={handleAdminLogin} />;

  const renderDashboard = () => {
    const unpaidDriverCount = Math.max(0, (stats.totalDrivers || 0) - (stats.paidSubscriptions || 0));

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatsCard title="Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatsCard title="Drivers" value={stats.totalDrivers} icon={Car} color="indigo" />
        <StatsCard title="Pending" value={stats.pendingVerificationRequests} icon={ShieldCheck} trend="Review" color="orange" />
        <StatsCard title="Searches" value={stats.totalSearches || 0} icon={Eye} trend="Rider intent" color="blue" />
        <StatsCard title="Calls" value={stats.totalCalls} icon={Phone} trend="Leads" color="green" />
        <StatsCard title="Reports" value={stats.activeDriverReports} icon={Flag} trend="Active" color="orange" />
        <StatsCard title="Paid" value={stats.paidSubscriptions} icon={CreditCard} trend="Drivers" color="blue" />
        <StatsCard title="Confirmed" value={stats.reportedCompletedRides || 0} icon={CheckCircle2} trend="Rides" color="green" />
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
            <QuickAction icon={ShieldCheck} label={`${stats.pilotReadiness?.driversReady || 0} pilot-ready drivers`} onClick={() => setActiveTab('pilot')} />
            <QuickAction icon={BookOpenCheck} label={`${stats.bookingStatus?.pending || 0} pending bookings`} onClick={() => setActiveTab('bookings')} />
            <QuickAction icon={Flag} label={`${stats.activeDriverReports || 0} active driver reports`} onClick={() => setActiveTab('complaints')} />
            <QuickAction icon={CreditCard} label={`${stats.paidSubscriptions || 0} paid subscriptions`} onClick={() => setActiveTab('drivers')} />
            <QuickAction icon={Ban} label={`${stats.suspendedUsers || 0} suspended users`} onClick={() => setActiveTab('riders')} />
            <QuickAction icon={Activity} label="View activity log" onClick={() => setActiveTab('activity')} />
          </div>
          <SubscriptionReminderPanel
            unpaidCount={unpaidDriverCount}
            state={subscriptionReminderState}
            onSend={sendSubscriptionReminders}
          />
        </section>
      </div>

      <UserTable limit={5} refreshKey={usersRefreshKey} onChanged={refreshAdminData} onSelectUser={openUserDetail} />
    </div>
    );
  };

  const renderPilotReadiness = () => {
    const pilot = stats.pilotReadiness || EMPTY_STATS.pilotReadiness;
    const blockers = Array.isArray(pilot.blockers) ? pilot.blockers : [];
    const driverIssues = Array.isArray(pilot.driverIssues) ? pilot.driverIssues : [];
    const readinessPercent = Math.max(0, Math.min(100, pilot.readinessPercent || 0));
    const unpaidDriverCount = Math.max(0, (stats.totalDrivers || 0) - (stats.paidSubscriptions || 0));

    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 p-5 text-white sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white/45">Pilot Readiness Mode</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {pilot.driversReady || 0} of {stats.totalDrivers || 0} drivers ready
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/60">
                  A driver is pilot-ready only when phone, vehicle type, number plate, taxi stand, vehicle photo,
                  license photo, verification, and account status are all clean.
                </p>
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#FFC857] text-2xl font-black text-[#1A1205]">
                {readinessPercent}%
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#FFC857] transition-all" style={{ width: `${readinessPercent}%` }} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          <PilotMetricCard label="Drivers Ready" value={pilot.driversReady || 0} tone="green" />
          <PilotMetricCard label="Verified Drivers" value={pilot.verifiedDrivers || 0} tone="blue" />
          <PilotMetricCard label="Pending Docs" value={pilot.pendingDocuments || 0} tone="amber" />
          <PilotMetricCard label="Riders Registered" value={pilot.ridersRegistered || stats.totalRiders || 0} tone="slate" />
          <PilotMetricCard label="Open Complaints" value={pilot.openComplaints || 0} tone="red" />
          <PilotMetricCard label="Broken Profiles" value={pilot.brokenProfiles || 0} tone="amber" />
          <PilotMetricCard label="No Phone" value={pilot.withoutPhone || 0} tone="red" />
          <PilotMetricCard label="No Plate/Stand" value={(pilot.withoutPlate || 0) + (pilot.withoutStand || 0)} tone="red" />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader title="Fix First" subtitle="The fastest path to a clean 80-driver pilot." />
          {blockers.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {blockers.map((blocker) => (
                <PilotBlockerButton
                  key={blocker.key}
                  blocker={blocker}
                  onClick={() => setActiveTab(blocker.tab || 'drivers')}
                />
              ))}
            </div>
          ) : (
            <EmptyState label="No pilot blockers found. Keep the driver list fresh before launch." />
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader
            title="Broken Driver Profiles"
            subtitle="Tap a driver to fix missing pilot fields."
            actionLabel="Open Drivers"
            onAction={() => setActiveTab('drivers')}
          />
          {driverIssues.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {driverIssues.map((driver) => (
                <PilotDriverIssue
                  key={driver.id || driver.clerkId}
                  driver={driver}
                  onOpen={() => openUserDetail(driver.id || driver.clerkId)}
                />
              ))}
            </div>
          ) : (
            <EmptyState label="No broken driver profiles in the first 1,000 users." />
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeader title="Emergency Mobile Controls" subtitle="Quick actions for running the pilot from your phone." />
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <PilotControlButton icon={Car} label="Drivers" onClick={() => setActiveTab('drivers')} />
            <PilotControlButton icon={ShieldCheck} label="Verify / Reject" onClick={() => setActiveTab('verifications')} />
            <PilotControlButton icon={Flag} label="Complaints" onClick={() => setActiveTab('complaints')} />
            <PilotControlButton icon={Activity} label="Call Leads" onClick={() => setActiveTab('analytics')} />
            <PilotControlButton icon={Download} label="Export Drivers" onClick={() => downloadExport('drivers')} />
            <PilotControlButton icon={Download} label="Export Riders" onClick={() => downloadExport('riders')} />
            <PilotControlButton icon={MessageCircle} label="Payment Reminder" onClick={sendSubscriptionReminders} disabled={subscriptionReminderState.status === 'loading' || unpaidDriverCount === 0} />
            <PilotControlButton icon={RefreshCw} label="Sync & Refresh" onClick={syncAndRefreshAdminWorkspace} disabled={syncState.status === 'loading'} />
          </div>
          {subscriptionReminderState.message && (
            <p className={`mt-3 rounded-2xl border p-3 text-sm font-black ${
              subscriptionReminderState.status === 'error'
                ? 'border-red-100 bg-red-50 text-red-700'
                : 'border-green-100 bg-green-50 text-green-700'
            }`}>
              {subscriptionReminderState.message}
            </p>
          )}
        </section>
      </div>
    );
  };

  const renderVerifications = () => (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionShell
        title="Driver Verification"
        subtitle={`${stats.pendingVerificationRequests} pending requests`}
        onRefresh={loadVerificationRequests}
        actionLabel="Export CSV"
        onAction={() => downloadExport('verifications')}
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
      <SectionShell
        title="Booking Oversight"
        subtitle="Assign drivers and update ride states"
        onRefresh={loadBookings}
        actionLabel="Export CSV"
        onAction={() => downloadExport('bookings')}
      >
        {loading.bookings ? (
          <EmptyState label="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState label="No bookings yet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                drivers={availableDrivers}
                selectedDriver={assignmentByBooking[booking.id] || booking.driverId || ''}
                onSelectDriver={(driverId) =>
                  setAssignmentByBooking((current) => ({ ...current, [booking.id]: driverId }))
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
        <StatsCard title="Searches" value={stats.totalSearches || 0} icon={Search} color="blue" />
        <StatsCard title="Profile Views" value={stats.totalProfileViews || 0} icon={Eye} color="blue" />
        <StatsCard title="Call Clicks" value={stats.totalCalls || 0} icon={Phone} color="green" />
        <StatsCard title="WhatsApp" value={stats.totalWhatsAppClicks || 0} icon={MessageCircle} color="indigo" />
        <StatsCard title="Reports" value={stats.activeDriverReports || 0} icon={Flag} color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatsCard title="Pending" value={stats.bookingStatus?.pending || 0} icon={Clock} color="orange" />
        <StatsCard title="Accepted" value={stats.bookingStatus?.accepted || 0} icon={BookOpenCheck} color="blue" />
        <StatsCard title="Completed" value={stats.bookingStatus?.completed || 0} icon={CheckCircle2} color="green" />
        <StatsCard title="Cancelled" value={stats.bookingStatus?.cancelled || 0} icon={XCircle} color="indigo" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <SectionHeader title="Top Destinations" subtitle="Based on instant booking requests" actionLabel="Export CSV" onAction={() => downloadExport('analytics')} />
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
      <SectionShell
        title="Complaints & Support"
        subtitle={`${stats.pendingComplaints} active tickets`}
        onRefresh={loadComplaints}
        actionLabel="Export CSV"
        onAction={() => downloadExport('complaints')}
      >
        {loading.complaints ? (
          <EmptyState label="Loading messages..." />
        ) : complaints.length === 0 ? (
          <EmptyState label="No support messages yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <SupportTicket key={complaint.id} complaint={complaint} onUpdate={updateComplaint} />
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
      <SectionShell
        title="Admin Activity Log"
        subtitle="Recent operational changes"
        onRefresh={loadActivity}
        actionLabel="Export CSV"
        onAction={() => downloadExport('activity')}
      >
        <ActivityFeed logs={activityLogs} loading={loading.activity} />
      </SectionShell>
    </section>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'riders':
        return <UserTable role="rider" exportType="riders" refreshKey={usersRefreshKey} onChanged={refreshAdminData} onSelectUser={openUserDetail} />;
      case 'drivers':
        return <UserTable role="driver" exportType="drivers" refreshKey={usersRefreshKey} onChanged={refreshAdminData} onSelectUser={openUserDetail} />;
      case 'pilot':
        return renderPilotReadiness();
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
    <div className="lobby-admin-gradient min-h-screen font-sans md:flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        badges={badges}
      />

      <main className="min-w-0 flex-1 pb-24 md:h-screen md:overflow-y-auto md:pb-8">
        <header className="lobby-admin-topbar-gradient sticky top-0 z-30 border-b border-white/60 px-4 py-3 backdrop-blur-xl md:static md:border-0 md:px-8 md:py-8">
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

            <div className="flex items-center gap-2">
              <button
                onClick={syncAndRefreshAdminWorkspace}
                disabled={syncState.status === 'loading'}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={17} className={syncState.status === 'loading' ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{syncState.status === 'loading' ? 'Syncing' : 'Sync & Refresh'}</span>
              </button>

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
          </div>

          {syncState.message && (
            <p className={`mt-2 text-xs font-black ${syncState.status === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
              {syncState.message}
            </p>
          )}

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
                  activeTab === tab.id ? 'bg-[#58A6FF] text-slate-950 shadow-sm shadow-[#58A6FF]/20' : 'bg-white/80 text-slate-600'
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

      {isExitPromptOpen && (
        <AdminExitPrompt
          onCancel={() => setExitPromptOpen(false)}
          onConfirm={handleLogout}
        />
      )}

      {selectedUserDetail && (
        <UserDetailDrawer
          detail={selectedUserDetail}
          form={detailForm}
          setForm={setDetailForm}
          loading={loading.detail}
          saveState={profileSaveState}
          onClose={() => setSelectedUserDetail(null)}
          onSave={saveUserDetail}
          onSuspend={() => setUserSuspension('suspend')}
          onUnsuspend={() => setUserSuspension('unsuspend')}
          onAvailabilityChange={setDriverAvailability}
          onSubscriptionChange={setDriverSubscription}
          onRoleChange={setUserRole}
          onDelete={deleteSelectedUser}
        />
      )}
    </div>
  );
}

function AdminExitPrompt({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-950/60 p-3 sm:items-center sm:p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Log out of admin?</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Leaving the admin page will end this admin session. You will need to sign in again to return.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="min-h-12 rounded-2xl bg-slate-100 px-4 text-sm font-black text-slate-700"
          >
            Stay Here
          </button>
          <button
            onClick={onConfirm}
            className="min-h-12 rounded-2xl bg-red-600 px-4 text-sm font-black text-white"
          >
            Log Out
          </button>
        </div>
      </section>
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

function SectionShell({ title, subtitle, onRefresh, actionLabel, onAction, children }) {
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm font-semibold text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
            >
              <Download size={16} />
              {actionLabel}
            </button>
          )}
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

function PilotMetricCard({ label, value, tone = 'slate' }) {
  const tones = {
    green: 'bg-green-50 text-green-700 ring-green-100',
    blue: 'bg-[#EAF4FF] text-[#2F80ED] ring-[#CFE4FF]',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    slate: 'bg-slate-50 text-slate-800 ring-slate-100',
  };

  return (
    <div className={`rounded-3xl p-4 shadow-sm ring-1 sm:p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function PilotBlockerButton({ blocker, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-24 items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#58A6FF]/30 hover:bg-white"
    >
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-900">{blocker.label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">Tap to review</p>
      </div>
      <span className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl bg-white px-3 text-lg font-black text-red-600 ring-1 ring-slate-100">
        {blocker.count}
      </span>
    </button>
  );
}

function PilotControlButton({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function PilotDriverIssue({ driver, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#58A6FF]/30 hover:bg-white"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-black text-slate-950">{driver.fullName || 'Unnamed driver'}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">{driver.phone || 'No phone added'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
          driver.isAvailable ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-500'
        }`}>
          {driver.isAvailable ? 'Hidden until fixed' : 'Offline'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(driver.missing || []).slice(0, 5).map((item) => (
          <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-red-600 ring-1 ring-red-100">
            {item}
          </span>
        ))}
        {(driver.missing || []).length > 5 && (
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">
            +{driver.missing.length - 5}
          </span>
        )}
      </div>
    </button>
  );
}

function SubscriptionReminderPanel({ unpaidCount, state, onSend }) {
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isSuccess = state.status === 'success';
  const links = Array.isArray(state.links) ? state.links : [];

  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-100">
          <CreditCard size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-slate-900">Subscription reminders</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Send dashboard reminders and prepare WhatsApp chats for unpaid drivers.
          </p>
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-400">
            {unpaidCount} unpaid driver{unpaidCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSend}
        disabled={isLoading || unpaidCount === 0}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        {isLoading ? 'Preparing reminders...' : 'Send Payment Reminder'}
      </button>

      {state.message && (
        <div className={`mt-3 rounded-2xl border p-3 text-sm font-black ${
          isError
            ? 'border-red-100 bg-red-50 text-red-700'
            : isSuccess
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-[#CFE4FF] bg-[#EAF4FF] text-[#2F80ED]'
        }`}>
          {state.message}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            WhatsApp chats
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {links.slice(0, 25).map((link) => (
              <a
                key={`${link.driverId}-${link.phone}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-white px-3 text-sm font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-green-50 hover:text-green-700"
              >
                <span className="min-w-0 truncate">{link.driverName}</span>
                <MessageCircle size={16} className="shrink-0" />
              </a>
            ))}
          </div>
          {state.skippedWhatsappCount > 0 && (
            <p className="text-xs font-semibold text-slate-400">
              {state.skippedWhatsappCount} driver{state.skippedWhatsappCount === 1 ? '' : 's'} need a phone number before WhatsApp can be opened.
            </p>
          )}
        </div>
      )}
    </div>
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
        const rejectionReason = rejectionByRequest[request.id] || REJECTION_REASONS[0];
        return (
          <article key={request.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                <InfoBlock label="Type" value={vehicleTypeLabel(request.vehicleType) || 'Not added'} />
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
                      setRejectionByRequest((current) => ({ ...current, [request.id]: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700"
                  >
                    {REJECTION_REASONS.map((reason) => (
                      <option key={reason}>{reason}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onReview(request.id, 'approve')}
                      disabled={workingRequestId === request.id}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-green-600 px-3 py-2 text-sm font-black text-white disabled:opacity-50"
                    >
                      <CheckCircle2 size={17} />
                      Approve
                    </button>
                    <button
                      onClick={() => onReview(request.id, 'reject', rejectionReason)}
                      disabled={workingRequestId === request.id}
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
        <InfoBlock label="Requested Stand" value={booking.requestedStand || 'Any stand'} />
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
            <option key={driver.clerkId || driver.id} value={driver.clerkId || driver.id}>
              {driver.fullName} {driver.isAvailable ? '(online)' : '(offline)'}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate('accepted')}
            className="rounded-2xl bg-[#58A6FF] px-3 py-3 text-sm font-black text-slate-950"
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
            {complaint.reportType === 'driver_report' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-600 ring-1 ring-red-100">
                <Flag size={12} />
                Driver report
              </span>
            )}
          </div>
          <p className="mt-1 break-all text-xs font-semibold text-slate-500">{complaint.email || 'No email'}</p>
          {complaint.driverName && (
            <p className="mt-1 text-xs font-black text-red-500">Reported driver: {complaint.driverName}</p>
          )}
        </div>
        <select
          value={complaint.status}
          onChange={(event) => onUpdate(complaint.id, event.target.value)}
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
        <article key={log.id} className="py-4 first:pt-0 last:pb-0">
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

function UserDetailDrawer({
  detail,
  form,
  setForm,
  loading,
  saveState,
  onClose,
  onSave,
  onSuspend,
  onUnsuspend,
  onAvailabilityChange,
  onSubscriptionChange,
  onRoleChange,
  onDelete,
}) {
  const user = detail.user;
  const isSuspended = user.accountStatus === 'suspended';
  const subscriptionStatus = user.subscriptionStatus || 'unpaid';
  const isSaving = saveState?.status === 'saving';
  const driverReadiness = user.role === 'driver' ? getDriverReadiness(user) : null;
  const canMarkOnline = user.role !== 'driver' || user.isAvailable || (!isSuspended && driverReadiness?.ready);

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
                    <AdminSelect
                      label="Vehicle Type"
                      value={form.vehicleType}
                      onChange={(value) => setForm((current) => ({ ...current, vehicleType: value }))}
                      options={VEHICLE_TYPES}
                      placeholder="Select vehicle type"
                    />
                    <AdminInput
                      label="Number Plate"
                      value={form.vehiclePlate}
                      onChange={(value) => setForm((current) => ({ ...current, vehiclePlate: formatVehiclePlateInput(value) }))}
                      placeholder="NL 01 AB 1234"
                    />
                    <AdminInput
                      label="Taxi stands"
                      value={form.taxiStands}
                      onChange={(value) => setForm((current) => ({ ...current, taxiStands: value }))}
                      placeholder={TAXI_STANDS.map((stand) => stand.name).slice(0, 2).join(', ')}
                    />
                    <AdminInput
                      label="Checked in now"
                      value={form.currentStand}
                      onChange={(value) => setForm((current) => ({ ...current, currentStand: value }))}
                      placeholder="Current stand, or leave blank"
                    />
                    <AdminInput label="Routes" value={form.routes} onChange={(value) => setForm((current) => ({ ...current, routes: value }))} />
                    <AdminInput label="Rating" value={String(form.rating)} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
                    <AdminInput label="Admin Notes" value={form.aiNotes} onChange={(value) => setForm((current) => ({ ...current, aiNotes: value }))} />
                  </>
                )}
              </div>
              <button
                onClick={onSave}
                disabled={loading || isSaving}
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <ProfileSaveToast state={saveState} />
            </section>

            {user.role === 'driver' && (
              <section className="rounded-3xl border border-slate-200 p-4">
                <h3 className="font-black text-slate-900">Driver Operations</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Control marketplace visibility and subscription payment state.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <InfoBlock label="Availability" value={user.isAvailable ? 'Online' : 'Offline'} />
                  <InfoBlock label="Checked In" value={user.currentStand || 'Not set'} />
                  <InfoBlock label="Vehicle Type" value={vehicleTypeLabel(user.vehicleType) || 'Not added'} />
                  <InfoBlock label="Number Plate" value={user.vehiclePlate || 'Not added'} />
                  <InfoBlock
                    label="Subscription"
                    value={
                      subscriptionStatus === 'paid'
                        ? `Paid until ${formatDate(user.subscriptionPaidUntil)}`
                        : subscriptionStatus
                    }
                  />
                </div>

                {driverReadiness && !driverReadiness.ready && (
                  <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-bold leading-relaxed text-amber-800">
                    Missing before this driver can go online: {driverReadiness.missingText}.
                  </p>
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => onAvailabilityChange(!user.isAvailable)}
                    disabled={isSuspended || !canMarkOnline}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#58A6FF] px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    <ToggleRight size={16} />
                    {user.isAvailable ? 'Mark Offline' : 'Mark Online'}
                  </button>

                  <button
                    onClick={() =>
                      onSubscriptionChange(
                        subscriptionStatus === 'paid'
                          ? 'mark_subscription_unpaid'
                          : 'mark_subscription_paid'
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
                  >
                    <CreditCard size={16} />
                    {subscriptionStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-red-100 bg-red-50 p-4">
              <h3 className="font-black text-red-800">Account Control</h3>
              <p className="mt-1 text-sm font-semibold text-red-600">
                Suspension hides drivers from search and blocks operational actions.
              </p>
              <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-red-100">
                <label className="mb-1 block text-xs font-black uppercase text-slate-500">Account Type</label>
                <select
                  value={user.role}
                  onChange={(event) => onRoleChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-800 outline-none"
                >
                  <option value="rider">Rider</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
              {isSuspended && user.suspensionReason && (
                <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-semibold text-red-700">{user.suspensionReason}</p>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={isSuspended ? onUnsuspend : onSuspend}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-200"
                >
                  {isSuspended ? <RotateCcw size={16} /> : <Ban size={16} />}
                  {isSuspended ? 'Unsuspend User' : 'Suspend User'}
                </button>
                <button
                  onClick={onDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"
                >
                  <XCircle size={16} />
                  Delete User
                </button>
              </div>
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

function ProfileSaveToast({ state }) {
  if (!state?.message || state.status === 'idle') return null;

  const styles = {
    saving: 'border-[#CFE4FF] bg-[#EAF4FF] text-[#2F80ED]',
    success: 'border-green-100 bg-green-50 text-green-800',
    error: 'border-red-100 bg-red-50 text-red-800',
  };
  const Icon = state.status === 'success'
    ? CheckCircle2
    : state.status === 'error'
      ? AlertCircle
      : RefreshCw;

  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-2xl border p-3 text-sm font-black shadow-sm transition ${styles[state.status] || styles.saving}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={16} className={state.status === 'saving' ? 'animate-spin' : ''} />
      <span>{state.message}</span>
    </div>
  );
}

function AdminInput({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <input
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function AdminSelect({ label, value, onChange, options = [], placeholder = 'Select' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
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
        <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
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
