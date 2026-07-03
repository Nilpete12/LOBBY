"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Phone, Clock, LogOut, History, CheckCircle2, AlertCircle, X } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function RiderDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportNotice, setReportNotice] = useState(null);

  const handleReport = async () => {
    const message = complaintText.trim();
    if (!message) {
      setReportNotice({ type: 'error', message: 'Please describe the issue before submitting.' });
      return;
    }

    setIsReporting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          role: user.publicMetadata?.role || 'rider',
          topic: 'Rider Issue',
          message
        })
      });

      if (!res.ok) {
        throw new Error('Complaint submission failed');
      }

      setShowComplaint(false);
      setComplaintText("");
      setReportNotice({
        type: 'success',
        message: 'Issue reported. Our team has received it and will review it shortly.'
      });
    } catch (error) {
      console.error("Failed to report issue", error);
      setReportNotice({
        type: 'error',
        message: 'We could not send your report. Please try again.'
      });
    } finally {
      setIsReporting(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/');
      return;
    }

    if (!user?.publicMetadata?.role) {
      router.push('/onboarding');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/rider/history?riderId=${user.id}`
        );
        const data = await res.json();

        if (data.success) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (!reportNotice) return;

    const timer = window.setTimeout(() => setReportNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [reportNotice]);

  const handleLogout = () => {
    signOut(() => router.push('/'));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-semibold text-slate-400">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 pb-28 pt-20 sm:px-6 sm:pt-24 md:pb-12">
      <div className="mx-auto max-w-4xl">
        {reportNotice && (
          <ReportNotice notice={reportNotice} onDismiss={() => setReportNotice(null)} />
        )}

        {/* Header */}
        <div className="mb-6 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:rounded-4xl sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#DCFCE7] to-[#DBEAFE] text-xl font-bold text-[#0F766E] shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  sizes="64px"
                />
              ) : (
                user.fullName?.charAt(0) || "U"
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {user.fullName || "Rider"}
              </h1>
              <p className="mt-1 break-all text-xs font-medium text-slate-500 sm:text-sm">
                Rider Account • {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-500 sm:w-auto sm:border-transparent sm:bg-transparent sm:p-3"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Recent Contacts */}
        <div className="min-h-104 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:rounded-4xl sm:p-8">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5 sm:mb-6 sm:pb-6">
            <div className="rounded-2xl bg-linear-to-br from-[#DCFCE7] to-[#DBEAFE] p-2.5 text-[#0F766E] shadow-sm sm:p-3">
              <History size={24} />
            </div>

            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Recently Contacted Drivers
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center sm:py-12">
              <p className="mx-auto mb-4 max-w-xs text-slate-400">
                You haven&apos;t contacted any drivers yet.
              </p>

              <button
                onClick={() => router.push('/search')}
                className="w-full rounded-2xl bg-[#0F766E] px-7 py-3 font-semibold text-white shadow-lg shadow-cyan-100 transition hover:bg-[#115E59] sm:w-auto"
              >
                Find a Ride
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {history.map((driver) => (
                <div
                  key={driver._id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 transition duration-300 hover:shadow-xl sm:rounded-[1.75rem] sm:p-5"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Driver Pic */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#DCFCE7] to-[#DBEAFE] shadow-sm">
                      {driver.profilePic ? (
                        <Image
                          src={driver.profilePic}
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#0F766E]">
                          {driver.fullName[0]}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold tracking-tight text-slate-900">
                        {driver.fullName}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="max-w-full truncate">{driver.vehicle}</span>
                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(driver.lastCalled).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`tel:${driver.phone}`}
                      aria-label={`Call ${driver.fullName}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-lg shadow-cyan-100 transition hover:scale-105"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Issue Button */}
        <button
          onClick={() => setShowComplaint(true)}
          className="mx-auto mt-6 block rounded-full px-4 py-2 text-sm font-semibold text-slate-500 underline transition hover:text-[#0F766E]"
        >
          Report an Issue
        </button>

        {/* Modal */}
        {showComplaint && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center sm:p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-4xl border border-slate-200 bg-white/95 p-5 text-left shadow-2xl backdrop-blur-sm sm:rounded-4xl sm:p-8 sm:text-center">
              <h3 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Report an Issue
              </h3>

              <textarea
                className="mb-4 h-32 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 text-sm outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                placeholder="Describe what happened..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                <button
                  onClick={() => setShowComplaint(false)}
                  disabled={isReporting}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 sm:border-transparent sm:py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReport}
                  disabled={!complaintText.trim() || isReporting}
                  className="rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
                >
                  {isReporting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ReportNotice({ notice, onDismiss }) {
  const isSuccess = notice.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      role="status"
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        <Icon size={20} />
      </div>
      <p className="min-w-0 flex-1 text-sm font-bold leading-relaxed">{notice.message}</p>
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
