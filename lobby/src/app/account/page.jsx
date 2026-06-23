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

  // --- THE FIXED USE-EFFECT ---
  useEffect(() => {
    // 1. Wait for Clerk to load
    if (!isLoaded) return;

    // 2. Security Check: If not signed in, redirect
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    // 3. Onboarding Check: If they have no role, force them to setup
    if (!user?.publicMetadata?.role) {
      router.push('/onboarding');
      return;
    }

    // 4. If all checks pass, fetch their ride history
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/rider/history?riderId=${user.id}`);
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.fullName?.charAt(0) || "U"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
              <p className="text-slate-500 text-sm">Rider Account • {user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition flex items-center gap-2 text-sm font-bold">
            <LogOut size={20}/> Logout
          </button>
        </div>
        
        {/* Recent Contacts Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-100">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <History size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Recently Contacted Drivers</h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">You haven't contacted any drivers yet.</p>
              <button onClick={() => router.push('/search')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition">
                Find a Ride
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {history.map((driver) => (
                <div key={driver._id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition bg-slate-50 hover:bg-white group">
                  <div className="flex items-center gap-4">
                    {/* Driver Pic */}
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {driver.profilePic ? (
                        <img src={driver.profilePic} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{driver.fullName[0]}</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{driver.fullName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{driver.vehicle}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(driver.lastCalled).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <a href={`tel:${driver.phone}`} className="p-3 bg-green-500 text-white rounded-full shadow-lg shadow-green-200 hover:scale-105 transition">
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
        <button 
          onClick={() => setShowComplaint(true)}
          className="mt-4 text-sm font-bold text-red-500 hover:text-red-700 underline"
        >
          Report an Issue
        </button>

        {/* The Modal */}
        {showComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl text-center items-center">
              <h3 className="font-bold text-2xl mb-2">Report an Issue</h3>
              <textarea
                className="w-full border p-3 rounded-lg mb-4 h-32 outline-none focus:border-blue-500"
                placeholder="Describe what happened..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowComplaint(false)} className="text-slate-500 font-bold text-sm">Cancel</button>
                <button onClick={handleReport} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}