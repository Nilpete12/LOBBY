import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Phone, Car, Save, LogOut, Lock, Clock } from 'lucide-react';
import { useAuth } from '../context/Authcontext'; 

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get global logout function
  
  const [driver, setDriver] = useState(null);
  
  const [formData, setFormData] = useState({
    vehicle: '',
    phone: '',
    routes: ''
  });

  const [isOnline, setIsOnline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) { 
      navigate('/auth'); 
      return; 
    }

    // A. Load cached data first (for instant UI)
    try {
      const cachedUser = JSON.parse(userStr);
      setDriver(cachedUser);
      setFormData({
        vehicle: cachedUser.vehicle || '',
        phone: cachedUser.phone || '',
        routes: cachedUser.routes ? cachedUser.routes.join(', ') : ''
      });
      setIsOnline(cachedUser.isAvailable || false);
    } catch (e) {
      console.error("Error parsing user data", e);
      logout();
      navigate('/auth');
      return;
    }

    // B. FETCH FRESH DATA FROM SERVER (Syncs Verification Status)
    const syncProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        const data = await res.json();
        
        if (data.success) {
          // Update State AND LocalStorage with the new data
          setDriver(data.user);
          localStorage.setItem('user', JSON.stringify(data.user)); 
          setIsOnline(data.user.isAvailable); // Ensure switch reflects server state
        }
      } catch (err) {
        console.error("Failed to sync profile", err);
      }
    };

    syncProfile();

  }, [navigate, logout]); 

  const handleUpdate = async (newStatus) => {
    setIsSaving(true);
    const statusToSend = newStatus !== undefined ? newStatus : isOnline;

    try {
      const res = await fetch('http://localhost:5000/api/driver/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: driver._id || driver.id,
          vehicle: formData.vehicle,
          phone: formData.phone,
          routes: formData.routes.split(',').map(s => s.trim()).filter(Boolean),
          isAvailable: statusToSend
        })
      });
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setDriver(data.user);
        setIsOnline(data.user.isAvailable);
        if (newStatus === undefined) alert("Profile Saved!");
      }
    } catch (err) {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus); // Optimistic UI update
    handleUpdate(newStatus); // Background server update
  };

  // 3. New Logout Handler (Clears Navbar)
  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  // Loading State
  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  const isVerified = driver.isVerified === true;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Verification Warning */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-yellow-800 animate-in fade-in slide-in-from-top-4">
            <div className="bg-yellow-100 p-2 rounded-full"><Clock size={20}/></div>
            <div>
              <h3 className="font-bold">Account Pending Verification</h3>
              <p className="text-sm">You cannot go online until an Admin approves your account. Please wait.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {driver.fullName ? driver.fullName.charAt(0) : 'D'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{driver.fullName}</h1>
              <p className="text-slate-500 text-sm">
                {isVerified ? "Verified Driver" : "Pending Approval"} • {driver.email}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition flex items-center gap-2 text-sm font-bold">
            <LogOut size={20}/> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Status Control */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Availability</h2>
            
            <button 
              onClick={isVerified ? toggleStatus : null}
              disabled={!isVerified}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                !isVerified ? 'bg-slate-100 opacity-50 cursor-not-allowed' :
                isOnline ? 'bg-green-500 shadow-green-200 scale-105' : 
                'bg-slate-200 shadow-slate-200 grayscale'
              }`}
            >
              {!isVerified ? <Lock size={32} className="text-slate-400"/> : <Power size={48} className="text-white" />}
            </button>
            
            <p className="mt-6 font-bold text-slate-400 uppercase text-sm">
              {!isVerified ? "Account Locked" : isOnline ? "You are Visible" : "You are Hidden"}
            </p>
          </div>

          {/* Profile Settings */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Ride Details</h2>
            <div className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Vehicle Model</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <Car size={18} className="text-slate-400"/>
                  <input 
                    className="bg-transparent w-full p-3 outline-none font-medium" 
                    placeholder="e.g. Maruti 800"
                    value={formData.vehicle}
                    onChange={e => setFormData({...formData, vehicle: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <Phone size={18} className="text-slate-400"/>
                  <input 
                    className="bg-transparent w-full p-3 outline-none font-medium" 
                    placeholder="e.g. 98630..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Your Routes (comma separated)</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <MapPin size={18} className="text-slate-400"/>
                  <input 
                    className="bg-transparent w-full p-3 outline-none font-medium" 
                    placeholder="e.g. Shillong, Dawki, Airport"
                    value={formData.routes}
                    onChange={e => setFormData({...formData, routes: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={() => handleUpdate()}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition flex items-center justify-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Details"} <Save size={18}/>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}