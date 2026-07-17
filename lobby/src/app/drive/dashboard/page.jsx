"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs'; 
import { Power, MapPin, Phone, Car, Save, LogOut, Lock, Clock, Camera, UploadCloud, Loader2, FileText, CheckCircle2, AlertCircle, X, ShieldCheck, Wallet, History, MessageCircle, Hash } from 'lucide-react';
import API_BASE_URL from '@/config';
import IncomingRideAlert from '@/components/IncomingRideAlert';
import { TAXI_STANDS } from '@/lib/taxiStands';
import { VEHICLE_TYPES, vehicleTypeLabel } from '@/lib/vehicleTypes';

const DRIVER_PROFILE_CACHE_TTL = 60 * 1000;
const CLIENT_UPLOAD_TARGET_BYTES = 3.5 * 1024 * 1024;
const CANVAS_COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function getDriverProfileCacheKey(clerkId) {
  return `lobby:driver-profile:${clerkId}`;
}

function readCachedDriverProfile(clerkId) {
  if (typeof window === 'undefined' || !clerkId) return null;

  try {
    const raw = window.sessionStorage.getItem(getDriverProfileCacheKey(clerkId));
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.savedAt || Date.now() - cached.savedAt > DRIVER_PROFILE_CACHE_TTL) return null;

    return cached.driver || null;
  } catch {
    return null;
  }
}

function writeCachedDriverProfile(clerkId, driver) {
  if (typeof window === 'undefined' || !clerkId || !driver) return;

  try {
    window.sessionStorage.setItem(
      getDriverProfileCacheKey(clerkId),
      JSON.stringify({ savedAt: Date.now(), driver })
    );
  } catch {
    // Cache writes are best-effort only.
  }
}

export default function DriverDashboard() {
  const router = useRouter();
  
  // 1. CLERK AUTHENTICATION STATE
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const clerkUserId = clerkUser?.id;
  
  // 2. MONGODB DRIVER STATE (Vehicle, Routes, Verification, etc.)
  const [driverDbData, setDriverDbData] = useState(null);
  
  const [formData, setFormData] = useState({ vehicle: '', vehicleType: '', vehiclePlate: '', phone: '', routes: '', taxiStands: [], currentStand: '' });
  const [isOnline, setIsOnline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingImageType, setUploadingImageType] = useState('');
  const [notice, setNotice] = useState(null);
  const [dashboardError, setDashboardError] = useState('');

  const showNotice = useCallback((type, title, message) => {
    setNotice({ type, title, message });
  }, []);

  const applyDriverProfile = useCallback((driver) => {
    setDriverDbData(driver);
    const routes = Array.isArray(driver.routes) ? driver.routes.join(', ') : driver.routes || '';

    setFormData({
      vehicle: driver.vehicle || '',
      vehicleType: driver.vehicleType || '',
      vehiclePlate: driver.vehiclePlate || '',
      phone: driver.phone || '',
      routes,
      taxiStands: Array.isArray(driver.taxiStands) ? driver.taxiStands : [],
      currentStand: driver.currentStand || '',
    });
    setIsOnline(driver.isAvailable || false);
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // --- 1. LOAD DATA (CLERK + MONGODB SYNC) ---
  useEffect(() => {
    let cancelled = false;

    // 1. Wait for Clerk to load
    if (!isLoaded) return;
    
    // 2. Boot out unauthenticated users
    if (!isSignedIn) { 
      router.push('/'); 
      return; 
    }

    // 3. Onboarding Check: Force setup if no role exists
    if (!clerkUser?.publicMetadata?.role) {
      router.push('/onboarding');
      return;
    }

    // 4. Security Check: Kick Riders out of the Driver Dashboard
    if (clerkUser.publicMetadata.role !== 'driver') {
      router.push('/account');
      return;
    }

    const cachedDriver = readCachedDriverProfile(clerkUser.id);
    if (cachedDriver) {
      window.queueMicrotask(() => {
        if (!cancelled) applyDriverProfile(cachedDriver);
      });
    }

    // Inside your useEffect...
    const fetchDriverProfile = async () => {
      setDashboardError('');

      try {
        // 1. Force the exact local relative path
        // 2. Add 'no-store' to destroy any cached {} responses
        const res = await fetch(`/api/driver/${clerkUser.id}`, {
          cache: 'no-store' 
        });
        
        const data = await res.json();
        
        if (data.success && data.driver) {
          applyDriverProfile(data.driver);
          writeCachedDriverProfile(clerkUser.id, data.driver);
        } else {
          const message = data.message || 'Driver profile could not be loaded.';
          setDashboardError(message);
          if (!cachedDriver) showNotice('error', 'Profile could not load', message);
          console.error("Backend response:", data);
        }
      } catch (err) { 
        console.error("Failed to fetch MongoDB driver data", err); 
        const message = 'Unable to connect to the driver profile service. Please refresh and try again.';
        setDashboardError(message);
        if (!cachedDriver) showNotice('error', 'Connection failed', message);
      }
    };
    
    fetchDriverProfile();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, clerkUser, router, showNotice, applyDriverProfile]);

  // --- 2. UPDATE TEXT DETAILS ---
  const handleUpdate = async (newStatus) => {
    setIsSaving(true);
    const statusToSend = newStatus !== undefined ? newStatus : isOnline;

    try {
      const res = await fetch(`${API_BASE_URL}/driver/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          vehicle: formData.vehicle,
          vehicleType: formData.vehicleType,
          vehiclePlate: formData.vehiclePlate,
          phone: formData.phone,
          routes: formData.routes.split(',').map(s => s.trim()).filter(Boolean),
          taxiStands: formData.taxiStands,
          currentStand: formData.currentStand,
          isAvailable: statusToSend
        })
      });
      
      const data = await res.json();
      if (data.success) {
        applyDriverProfile(data.driver);
        writeCachedDriverProfile(clerkUser.id, data.driver);
        if (newStatus === undefined) {
          showNotice('success', 'Profile saved', 'Your vehicle type, stand, phone, and route details were updated.');
        } else {
          showNotice(
            'success',
            data.driver.isAvailable ? 'You are online' : 'You are offline',
            data.driver.isAvailable ? 'Riders can now find you in search.' : 'You are hidden from rider search for now.'
          );
        }
      } else {
        showNotice('error', 'Could not save', data.message || 'Please check your details and try again.');
        if (newStatus !== undefined) setIsOnline(!newStatus);
      }
    } catch (err) {
      console.error("Failed to save driver profile", err);
      if (newStatus !== undefined) setIsOnline(!newStatus);
      showNotice('error', 'Save failed', 'Your changes could not be saved. Please try again.');
    }
    finally { setIsSaving(false); }
  };

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    handleUpdate(newStatus);
  };

  // --- 3. AI LICENSE UPLOAD HANDLER ---
  const handleLicenseUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingLicense(true);

    const uploadData = new FormData();

    try {
      const uploadFile = await prepareImageForUpload(file, 'license');
      uploadData.append('image', uploadFile);
      uploadData.append('clerkId', clerkUser.id);
      uploadData.append('type', 'license');
      uploadData.append('driverName', clerkUser.fullName);

      const res = await fetch(`${API_BASE_URL}/driver/upload`, {
        method: 'POST',
        credentials: 'same-origin',
        body: uploadData
      });
      
      const data = await readUploadResponse(res);
      
      if (data.success) {
        applyDriverProfile(data.driver);
        writeCachedDriverProfile(clerkUser.id, data.driver);
        if (data.driver.verificationStatus === 'Approved') {
          showNotice('success', 'License approved', 'Your license was verified successfully.');
        } else {
          showNotice('info', 'License uploaded', 'Your document is now awaiting manual admin review.');
        }
      } else {
        showNotice('error', 'Upload failed', data.message || 'Please try uploading the license again.');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Upload failed', 'The license could not be uploaded. Please try again.');
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleLogout = () => { signOut(() => router.push('/')); };

  const handleDismissNotification = useCallback(async (notificationId) => {
    if (!notificationId || !driverDbData || !clerkUserId) return;

    const previousDriver = driverDbData;
    const nextDriver = {
      ...driverDbData,
      notifications: (driverDbData.notifications || []).filter((notification) => (
        (notification.id || notification._id) !== notificationId
      )),
    };

    setDriverDbData(nextDriver);
    writeCachedDriverProfile(clerkUserId, nextDriver);

    try {
      const res = await fetch(`/api/driver/notifications/${encodeURIComponent(notificationId)}`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not close this reminder.');
      }
    } catch (error) {
      setDriverDbData(previousDriver);
      writeCachedDriverProfile(clerkUserId, previousDriver);
      showNotice('error', 'Reminder stayed open', error.message || 'Could not close this reminder. Please try again.');
    }
  }, [clerkUserId, driverDbData, showNotice]);

  // Show loading while Clerk initializes OR while MongoDB data fetches
  if (!isLoaded) return <DriverDashboardSkeleton message="Loading dashboard..." />;

  if (dashboardError && !driverDbData) {
    return (
      <div className="lobby-dashboard-gradient min-h-screen px-6 py-24">
        <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard unavailable</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{dashboardError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-black"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!driverDbData) return <DriverDashboardSkeleton message="Loading your driver profile..." />;
  
  const isVerified = driverDbData.isVerified === true;
  const verificationStatus = driverDbData.verificationStatus || (isVerified ? 'Approved' : 'Pending');
  const driverName = clerkUser.fullName || driverDbData.fullName || 'Driver';
  const driverEmail = clerkUser.primaryEmailAddress?.emailAddress || driverDbData.email || '';
  const routeList = formData.routes.split(',').map(route => route.trim()).filter(Boolean);
  const selectedTaxiStands = Array.isArray(formData.taxiStands) ? formData.taxiStands : [];
  const currentStand = formData.currentStand || '';
  const selectedVehicleTypeLabel = vehicleTypeLabel(formData.vehicleType);
  const dashboardNotifications = Array.isArray(driverDbData.notifications) ? driverDbData.notifications : [];
  const setupItems = [
    {
      label: 'Vehicle type',
      detail: selectedVehicleTypeLabel || 'Choose hatchback, sedan, SUV, or two wheeler',
      done: Boolean(selectedVehicleTypeLabel),
    },
    {
      label: 'Phone number',
      detail: formData.phone ? 'Added' : 'Add a number riders can call',
      done: Boolean(formData.phone),
    },
    {
      label: 'Taxi stands',
      detail: selectedTaxiStands.length ? `${selectedTaxiStands.length} stand${selectedTaxiStands.length === 1 ? '' : 's'} selected` : 'Select where you park daily',
      done: selectedTaxiStands.length > 0,
    },
    {
      label: 'Live check-in',
      detail: currentStand ? `Checked in at ${currentStand}` : 'Choose your stand for today',
      done: Boolean(currentStand),
    },
    {
      label: 'Routes',
      detail: routeList.length ? `${routeList.length} route${routeList.length === 1 ? '' : 's'} added` : 'Add pickup areas or common routes',
      done: routeList.length > 0,
    },
    {
      label: 'Vehicle photo',
      detail: driverDbData.carPic ? 'Uploaded' : 'Upload a clear vehicle photo',
      done: Boolean(driverDbData.carPic),
    },
    {
      label: 'Number plate',
      detail: formData.vehiclePlate ? formData.vehiclePlate : 'Add the vehicle registration number',
      done: Boolean(formData.vehiclePlate),
    },
    {
      label: 'Driving license',
      detail: driverDbData.licenseUrl ? verificationStatus : 'Upload your license for review',
      done: Boolean(driverDbData.licenseUrl),
    },
  ];
  const completedSetupCount = setupItems.filter(item => item.done).length;
  const completionPercent = Math.round((completedSetupCount / setupItems.length) * 100);
  const nextStep = isVerified
    ? isOnline
      ? currentStand
        ? `You are visible to riders near ${currentStand}.`
        : 'You are visible to riders now. Check in to a stand for better matching.'
      : 'Go online when you are ready to accept rides.'
    : driverDbData.licenseUrl
      ? 'Your documents are with admin for review.'
      : 'Upload your license to request approval.';

  return (    
    <div className="lobby-dashboard-gradient min-h-screen px-4 pb-28 pt-20 sm:px-6 lg:pt-24">
      <div className="mx-auto max-w-5xl">
        {notice && (
          <DashboardNotice notice={notice} onDismiss={() => setNotice(null)} />
        )}
        <IncomingRideAlert />
        <DriverDashboardReminders notifications={dashboardNotifications} onDismiss={handleDismissNotification} />

        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Driver workspace</p>
            <h1 className="truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-3 text-sm font-black text-red-500 shadow-sm transition hover:bg-red-50"
          >
            <LogOut size={18}/>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <section className="lobby-command-gradient mb-4 overflow-hidden rounded-3xl border border-white/20 text-white shadow-xl shadow-[#58A6FF]/20">
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-2xl font-black text-white">
                  {driverDbData.profilePic || clerkUser.imageUrl ? (
                    <Image
                      src={driverDbData.profilePic || clerkUser.imageUrl}
                      alt={`${driverName} profile`}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    driverName.charAt(0) || 'D'
                  )}
                </div>

                {uploadingImageType === 'profile' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/55">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                )}

                <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-slate-950 bg-white text-slate-900 shadow-lg transition hover:bg-slate-100" aria-label="Update profile photo">
                  <Camera size={17} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploadingImageType === 'profile'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      handleImageUpload(file, 'profile', clerkUser.id, applyDriverProfile, showNotice, setUploadingImageType);
                    }}
                  />
                </label>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black tracking-tight">{driverName}</h2>
                  <DriverStatusPill isVerified={isVerified} isOnline={isOnline} status={verificationStatus} />
                </div>
                {driverEmail && <p className="truncate text-sm font-semibold text-white/55">{driverEmail}</p>}
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white/75">{nextStep}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white/40">Availability</p>
                <p className="mt-1 text-3xl font-black tracking-tight">
                  {!isVerified ? 'Locked' : isOnline ? 'Online' : 'Offline'}
                </p>
              </div>

              <button
                onClick={isVerified ? toggleStatus : undefined}
                disabled={!isVerified || isSaving}
                className={`inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 text-base font-black transition ${
                  !isVerified
                    ? 'cursor-not-allowed bg-white/10 text-white/45'
                    : isOnline
                      ? 'bg-white text-slate-950 hover:bg-slate-100'
                      : 'bg-[#58A6FF] text-slate-950 hover:bg-[#2F80ED]'
                } disabled:opacity-70`}
              >
                {isSaving ? <Loader2 size={21} className="animate-spin" /> : !isVerified ? <Lock size={21} /> : <Power size={22} />}
                {!isVerified ? 'Waiting for approval' : isOnline ? 'Go offline' : 'Go online'}
              </button>
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3">
            <MetricStrip label="Setup" value={`${completionPercent}%`} />
            <MetricStrip label="Checked in" value={currentStand || 'Not set'} />
            <MetricStrip label="Plate" value={formData.vehiclePlate || 'Not set'} />
          </div>
        </section>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <QuickAction href="/drive/earnings" icon={Wallet} label="Analytics" detail="Views" />
          <QuickAction href="/drive/TripHistory" icon={History} label="Trips" detail="History" />
          <QuickAction href="/support" icon={MessageCircle} label="Support" detail="Help" />
        </div>

        <section className="mb-5 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Setup checklist</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">{completedSetupCount} of {setupItems.length} complete</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-900">
              {completionPercent}%
            </div>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#58A6FF] transition-all" style={{ width: `${completionPercent}%` }} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {setupItems.map((item) => (
              <SetupItem key={item.label} item={item} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
          <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Ride profile</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Details riders see</h2>
              </div>
              <ShieldCheck size={24} className="text-slate-300" />
            </div>

            <div className="space-y-4">
              <LabeledInput
                icon={Car}
                label="Vehicle model"
                value={formData.vehicle}
                placeholder="e.g. Maruti 800"
                onChange={(value) => setFormData({ ...formData, vehicle: value })}
              />

              <VehicleTypeSelector
                value={formData.vehicleType}
                onChange={(vehicleType) => setFormData({ ...formData, vehicleType })}
              />

              <LabeledInput
                icon={Hash}
                label="Number plate"
                value={formData.vehiclePlate}
                placeholder="e.g. NL01 AB 1234"
                autoCapitalize="characters"
                onChange={(value) => setFormData({ ...formData, vehiclePlate: formatVehiclePlateInput(value) })}
                helper="This helps riders identify the right vehicle before calling or boarding."
              />

              <LabeledInput
                icon={Phone}
                label="Phone number"
                value={formData.phone}
                placeholder="e.g. 98630..."
                inputMode="tel"
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />

              <TaxiStandSelector
                selected={selectedTaxiStands}
                onChange={(taxiStands) => setFormData({ ...formData, taxiStands })}
              />

              <CurrentStandSelector
                value={currentStand}
                selectedDailyStands={selectedTaxiStands}
                onChange={(currentStandValue) => setFormData({ ...formData, currentStand: currentStandValue })}
              />

              <LabeledInput
                icon={MapPin}
                label="Routes"
                value={formData.routes}
                placeholder="e.g. BOC, Kohima"
                onChange={(value) => setFormData({ ...formData, routes: value })}
                helper="Separate areas with commas so riders can find you faster."
              />

              <button
                onClick={() => handleUpdate()}
                disabled={isSaving}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                {isSaving ? 'Saving details...' : 'Save ride details'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Documents</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Photos and license</h2>
              </div>
              <FileText size={24} className="text-slate-300" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-400">Vehicle photo</label>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${driverDbData.carPic ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {driverDbData.carPic ? 'Uploaded' : 'Needed'}
                  </span>
                </div>

                <label className="group relative block h-40 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100">
                  {driverDbData.carPic ? (
                    <Image
                      src={driverDbData.carPic}
                      alt={`${formData.vehicle || 'Vehicle'} photo`}
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      {uploadingImageType === 'car' ? (
                        <>
                          <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
                          <span className="text-xs font-bold mt-1 text-[#2F80ED]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={24} />
                          <span className="text-xs font-bold mt-1">Upload Car Photo</span>
                        </>
                      )}
                    </div>
                  )}

                  {driverDbData.carPic && uploadingImageType === 'car' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                      <Loader2 size={24} className="mb-2 animate-spin" />
                      <span className="text-xs font-bold">Uploading...</span>
                    </div>
                  )}

                  {driverDbData.carPic && uploadingImageType !== 'car' && (
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-2xl bg-black/65 px-3 py-2 text-sm font-black text-white backdrop-blur-sm transition group-hover:bg-black/75">
                      <Camera size={17} />
                      Change vehicle photo
                    </div>
                  )}

                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploadingImageType === 'car'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      handleImageUpload(file, 'car', clerkUser.id, applyDriverProfile, showNotice, setUploadingImageType);
                    }}
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-400">Driving license</label>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                    isVerified ? 'bg-green-50 text-green-700' : driverDbData.licenseUrl ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {driverDbData.licenseUrl ? verificationStatus : 'Needed'}
                  </span>
                </div>
                
                <label className="relative flex min-h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-300 hover:bg-slate-100">
                  <div className="flex flex-col items-center justify-center">
                    {uploadingLicense ? (
                      <div className="flex flex-col items-center font-black text-[#2F80ED]">
                        <Loader2 size={28} className="mb-2 animate-spin" />
                        <span className="text-sm">Uploading license...</span>
                      </div>
                    ) : driverDbData.licenseUrl ? (
                       <div className="flex flex-col items-center font-black text-green-600">
                         <FileText size={28} className="mb-2" />
                         <span className="text-sm text-slate-700">License uploaded</span>
                         <span className="mt-1 text-xs font-bold text-slate-400">Tap to replace if needed</span>
                       </div>
                    ) : (
                      <>
                        <FileText size={28} className="mb-2 text-slate-400" />
                        <p className="mt-1 text-sm font-black text-slate-600">Upload license</p>
                        <p className="mt-1 text-xs font-bold text-slate-400">This sends a verification request to admin.</p>
                      </>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLicenseUpload}
                    disabled={uploadingLicense}
                  />
                </label>

                {driverDbData.licenseUrl && (
                  <a
                    href={driverDbData.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-black text-slate-500 underline underline-offset-4"
                  >
                    View uploaded license
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DriverDashboardSkeleton({ message }) {
  return (
    <div className="lobby-dashboard-gradient min-h-screen px-6 pb-12 pt-24">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-400">
          <Loader2 className="animate-spin" size={18} />
          {message}
        </div>

        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-3 w-64 max-w-full rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-8 h-5 w-32 rounded bg-slate-200" />
            <div className="mx-auto h-32 w-32 rounded-full bg-slate-200" />
            <div className="mx-auto mt-8 h-4 w-36 rounded bg-slate-100" />
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 h-5 w-32 rounded bg-slate-200" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-32 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverStatusPill({ isVerified, isOnline, status }) {
  const label = isVerified ? (isOnline ? 'Live' : 'Approved') : status || 'Pending';
  const tone = isVerified
    ? isOnline
      ? 'bg-[#58A6FF] text-slate-950'
      : 'bg-white/15 text-slate-950'
    : 'bg-yellow-300 text-slate-950';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${tone}`}>
      {isVerified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
      {label}
    </span>
  );
}

function MetricStrip({ label, value }) {
  return (
    <div className="min-w-0 border-white/10 px-5 py-4 first:border-0 sm:border-l">
      <p className="text-xs font-black uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, detail }) {
  return (
    <Link
      href={href}
      className="flex min-h-20 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
    >
      <Icon size={21} className="text-slate-900" />
      <span>
        <span className="block text-sm font-black text-slate-950">{label}</span>
        <span className="block truncate text-xs font-bold text-slate-400">{detail}</span>
      </span>
    </Link>
  );
}

function DriverDashboardReminders({ notifications, onDismiss }) {
  const reminders = (notifications || [])
    .filter((notification) => notification.type === 'subscription_reminder' && notification.status !== 'archived')
    .slice(0, 2);

  if (!reminders.length) return null;

  return (
    <section className="mb-5 space-y-3">
      {reminders.map((notification) => (
        <article
          key={notification.id || notification._id}
          className="relative rounded-3xl border border-amber-200 bg-amber-50 p-4 pr-12 text-amber-950 shadow-sm"
        >
          <button
            type="button"
            onClick={() => onDismiss?.(notification.id || notification._id)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-amber-800 shadow-sm transition hover:bg-white"
            aria-label="Close reminder"
          >
            <X size={17} />
          </button>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-amber-700">
              <Wallet size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-amber-700/70">Admin reminder</p>
              <h2 className="mt-1 text-base font-black">{notification.title || 'Subscription fee reminder'}</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-amber-900/80">{formatReminderMessage(notification.message)}</p>
              {notification.createdAt && (
                <p className="mt-2 text-xs font-bold text-amber-700/70">
                  Sent {new Date(notification.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function formatReminderMessage(message) {
  const fallback = 'Your driver subscription fee for THE LOBBY is pending. Please complete your payment to keep your profile active and visible to riders. Thank you.';
  const text = typeof message === 'string' ? message.trim() : '';

  if (!text) return fallback;

  return text
    .replace(/^this is THE LOBBY\./i, 'This is THE LOBBY.')
    .replace(/Please pay it to keep your profile active and visible to riders\./i, 'Please complete your payment to keep your profile active and visible to riders.');
}

function SetupItem({ item }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-[#DCEBFF] text-[#2F80ED]' : 'bg-white text-slate-400'}`}>
        {item.done ? <CheckCircle2 size={19} /> : <Clock size={18} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-950">{item.label}</p>
        <p className="truncate text-xs font-bold text-slate-400">{item.detail}</p>
      </div>
    </div>
  );
}

function formatVehiclePlateInput(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 -]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

function VehicleTypeSelector({ value = '', onChange }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="block text-xs font-black uppercase tracking-wide text-slate-400">Vehicle type</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${value ? 'bg-[#EAF4FF] text-[#2F80ED]' : 'bg-slate-100 text-slate-500'}`}>
          {value ? vehicleTypeLabel(value) : 'Select one'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {VEHICLE_TYPES.map((type) => {
          const isSelected = value === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`min-h-14 rounded-2xl border px-3 py-3 text-left transition ${
                isSelected
                  ? 'border-[#58A6FF] bg-[#EAF4FF] text-[#2F80ED] shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
              aria-pressed={isSelected}
            >
              <span className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#58A6FF] text-slate-950' : 'bg-white text-slate-400'}`}>
                  {isSelected ? <CheckCircle2 size={16} /> : <Car size={16} />}
                </span>
                <span className="text-sm font-black">{type.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-400">
        Riders can filter drivers by this type in search.
      </p>
    </div>
  );
}

function TaxiStandSelector({ selected = [], onChange }) {
  const selectedSet = new Set(selected);

  const toggleStand = (standName) => {
    const next = selectedSet.has(standName)
      ? selected.filter((name) => name !== standName)
      : [...selected, standName];

    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="block text-xs font-black uppercase tracking-wide text-slate-400">Daily taxi stands</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
          {selected.length || 0} selected
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {TAXI_STANDS.map((stand) => {
          const isSelected = selectedSet.has(stand.name);

          return (
            <button
              key={stand.id}
              type="button"
              onClick={() => toggleStand(stand.name)}
              className={`min-h-16 rounded-2xl border px-3 py-3 text-left transition ${
                isSelected
                  ? 'border-[#58A6FF] bg-[#EAF4FF] text-[#2F80ED] shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
              aria-pressed={isSelected}
            >
              <span className="flex items-start gap-2">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#58A6FF] text-slate-950' : 'bg-white text-slate-400'}`}>
                  {isSelected ? <CheckCircle2 size={14} /> : <MapPin size={14} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{stand.name}</span>
                  <span className="mt-0.5 block truncate text-xs font-semibold opacity-70">{stand.location}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-400">
        Riders can filter by these stands from the homepage.
      </p>
    </div>
  );
}

function CurrentStandSelector({ value = '', selectedDailyStands = [], onChange }) {
  const dailySet = new Set(selectedDailyStands);
  const preferredStands = [
    ...TAXI_STANDS.filter((stand) => dailySet.has(stand.name)),
    ...TAXI_STANDS.filter((stand) => !dailySet.has(stand.name)),
  ];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="block text-xs font-black uppercase tracking-wide text-slate-400">Checked in today</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${value ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {value ? 'Live stand set' : 'Not set'}
        </span>
      </div>

      <div className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-slate-300 focus-within:bg-white">
        <MapPin size={18} className="mr-3 shrink-0 text-slate-400" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-3 text-base font-bold text-slate-950 outline-none"
        >
          <option value="">No live stand selected</option>
          {preferredStands.map((stand) => (
            <option key={stand.id} value={stand.name}>
              {dailySet.has(stand.name) ? 'Daily: ' : ''}{stand.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-400">
        This tells riders where you are parked right now. Clear it when you leave the stand.
      </p>
    </div>
  );
}

function LabeledInput({ icon: Icon, label, value, placeholder, onChange, helper, inputMode = 'text', autoCapitalize }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <span className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-slate-300 focus-within:bg-white">
        <Icon size={18} className="mr-3 shrink-0 text-slate-400" />
        <input
          className="min-w-0 flex-1 bg-transparent py-3 text-base font-bold text-slate-950 outline-none placeholder:text-slate-300"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {helper && <span className="mt-2 block text-xs font-semibold text-slate-400">{helper}</span>}
    </label>
  );
}

function DashboardNotice({ notice, onDismiss }) {
  const isSuccess = notice.type === 'success';
  const isInfo = notice.type === 'info';

  const tone = isSuccess
    ? 'border-green-200 bg-green-50 text-green-800'
    : isInfo
      ? 'border-[#CFE4FF] bg-[#EAF4FF] text-[#2F80ED]'
      : 'border-red-200 bg-red-50 text-red-800';

  const iconTone = isSuccess
    ? 'bg-green-100 text-green-700'
    : isInfo
      ? 'bg-[#DCEBFF] text-[#2F80ED]'
      : 'bg-red-100 text-red-700';

  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${tone}`} role="status">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold">{notice.title}</h2>
        <p className="mt-0.5 text-sm font-medium opacity-85">{notice.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full p-1 opacity-70 transition hover:bg-white/60 hover:opacity-100"
        aria-label="Dismiss message"
      >
        <X size={17} />
      </button>
    </div>
  );
}

async function readUploadResponse(response) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (response.ok) return data;

  return {
    success: false,
    message: data.message || uploadStatusMessage(response.status),
  };
}

function uploadStatusMessage(status) {
  if (status === 401) return 'Please sign in again before uploading.';
  if (status === 403) return 'Only driver accounts can upload vehicle documents.';
  if (status === 404) return 'Driver profile or upload storage was not found.';
  if (status === 413) return 'That image is too large. Try a smaller photo.';
  return 'Upload failed. Please try again.';
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepareImageForUpload(file, type) {
  if (!file || file.size <= CLIENT_UPLOAD_TARGET_BYTES || typeof document === 'undefined') return file;

  const fileType = String(file.type || '').toLowerCase();
  if (!CANVAS_COMPRESSIBLE_TYPES.has(fileType)) return file;

  try {
    const image = await loadImageElement(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const maxSide = type === 'license' ? 2000 : 1600;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.72, 0.62]) {
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (blob && blob.size < file.size) {
        const baseName = file.name.replace(/\.[^.]+$/, '') || `${type}-upload`;
        return new File([blob], `${baseName}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
      }
    }
  } catch (error) {
    console.warn('Image compression skipped:', error);
  }

  return file;
}

// --- HELPER: HANDLE IMAGE UPLOAD ---
async function handleImageUpload(file, type, clerkId, onDriverUpdated, showNotice, setUploadingImageType) {
  if (!file) return;

  setUploadingImageType(type);

  const formData = new FormData();

  try {
    const uploadFile = await prepareImageForUpload(file, type);
    formData.append('image', uploadFile);
    formData.append('clerkId', clerkId);
    formData.append('type', type);

    const res = await fetch(`${API_BASE_URL}/driver/upload`, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    });
    
    const data = await readUploadResponse(res);
    if (data.success) {
      onDriverUpdated(data.driver);
      writeCachedDriverProfile(clerkId, data.driver);
      showNotice(
        'success',
        `${type === 'profile' ? 'Profile' : 'Car'} photo updated`,
        'Your new image is now saved to your driver profile.'
      );
    } else {
      showNotice('error', 'Upload failed', data.message || 'Please try uploading the image again.');
    }
  } catch (err) {
    console.error(err);
    showNotice('error', 'Upload failed', 'The image could not be uploaded. Please try again.');
  } finally {
    setUploadingImageType('');
  }
}
