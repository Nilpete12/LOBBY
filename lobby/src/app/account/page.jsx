"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Phone, Clock, LogOut, History } from 'lucide-react';
import API_BASE_URL from '@/config';

export default function RiderDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState("");

  const handleReport = async () => {
    if (!complaintText) return;

    await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        role: user.publicMetadata?.role || 'rider',
        topic: 'Rider Issue',
        message: complaintText
      })
    });

    setShowComplaint(false);
    setComplaintText("");
    alert("Issue reported to Admin.");
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
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] text-[#0F766E] rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden shadow-sm">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.fullName?.charAt(0) || "U"
              )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {user.fullName}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Rider Account • {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition flex items-center gap-2 text-sm font-semibold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 shadow-sm border border-slate-200 min-h-100">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] p-3 rounded-2xl text-[#0F766E] shadow-sm">
              <History size={24} />
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Recently Contacted Drivers
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">
                You haven't contacted any drivers yet.
              </p>

              <button
                onClick={() => router.push('/search')}
                className="bg-[#0F766E] text-white px-7 py-3 rounded-2xl font-semibold hover:bg-[#115E59] transition shadow-lg shadow-cyan-100"
              >
                Find a Ride
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {history.map((driver) => (
                <div
                  key={driver._id}
                  className="p-5 rounded-[1.75rem] border border-slate-200 bg-white hover:shadow-xl transition duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Driver Pic */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DCFCE7] to-[#DBEAFE] overflow-hidden shrink-0 shadow-sm">
                      {driver.profilePic ? (
                        <img
                          src={driver.profilePic}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#0F766E]">
                          {driver.fullName[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold tracking-tight text-slate-900">
                        {driver.fullName}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{driver.vehicle}</span>
                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(driver.lastCalled).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`tel:${driver.phone}`}
                      className="p-3 bg-[#0F766E] text-white rounded-full shadow-lg shadow-cyan-100 hover:scale-105 transition"
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
          className="mt-6 text-sm font-semibold text-slate-500 hover:text-[#0F766E] transition underline"
        >
          Report an Issue
        </button>

        {/* Modal */}
        {showComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] w-full max-w-md shadow-2xl text-center border border-slate-200">
              <h3 className="font-extrabold tracking-tight text-3xl text-slate-900 mb-4">
                Report an Issue
              </h3>

              <textarea
                className="w-full border border-slate-200 bg-[#F8FAFC] p-4 rounded-2xl mb-4 h-32 outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                placeholder="Describe what happened..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowComplaint(false)}
                  className="text-slate-500 font-semibold text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReport}
                  className="bg-[#0F766E] text-white px-5 py-2 rounded-2xl font-semibold text-sm hover:bg-[#115E59] transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
