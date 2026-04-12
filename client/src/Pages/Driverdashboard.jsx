import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Phone, Car, Save, LogOut, Lock, Clock, Camera, UploadCloud, Loader2, FileText } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import API_BASE_URL from '../config';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [driver, setDriver] = useState(null);
  
  const [formData, setFormData] = useState({
    vehicle: '',
    phone: '',
    routes: ''
  });

  const [isOnline, setIsOnline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false); // NEW STATE FOR AI

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) { navigate('/auth'); return; }

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
      logout(); navigate('/auth'); return;
    }

    const syncProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDriver(data.user);
          localStorage.setItem('user', JSON.stringify(data.user)); 
          setIsOnline(data.user.isAvailable);
        }
      } catch (err) { console.error(err); }
    };
    syncProfile();
  }, [navigate, logout]); 


  // --- 2. UPDATE TEXT DETAILS ---
  const handleUpdate = async (newStatus) => {
    setIsSaving(true);
    const statusToSend = newStatus !== undefined ? newStatus : isOnline;

    try {
      const res = await fetch(`${API_BASE_URL}/driver/update`, {
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
    } catch (err) { alert("Failed to save."); } 
    finally { setIsSaving(false); }
  };

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    handleUpdate(newStatus);
  };

  // --- 3. AI LICENSE UPLOAD HANDLER ---
  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLicense(true);

    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('userId', driver._id || driver.id);
    uploadData.append('type', 'license'); 
    uploadData.append('driverName', driver.fullName); // Crucial for AI matching

    try {
      const res = await fetch(`${API_BASE_URL}/driver/upload`, {
        method: 'POST',
        body: uploadData
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update state with new AI data
        setDriver(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show result to driver
        if (data.user.verificationStatus === 'Approved') {
          alert('✅ AI Verification Successful! Your license is approved.');
        } else {
          alert('⏳ Uploaded! Awaiting manual admin review (AI could not read the name clearly).');
        }
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error during license upload.');
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!driver) return <div className="p-20 text-center text-slate-400 font-bold">Loading...</div>;
  const isVerified = driver.isVerified === true;


  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Verification Warning */}
        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-yellow-800 animate-in fade-in">
            <div className="bg-yellow-100 p-2 rounded-full"><Clock size={20}/></div>
            <div>
              <h3 className="font-bold">Account Pending Verification</h3>
              <p className="text-sm">You cannot go online until an Admin approves your documents.</p>
            </div>
          </div>
        )}

        {/* --- HEADER (With Profile Pic Upload) --- */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            
            {/* PROFILE PICTURE UPLOADER */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                {driver.profilePic ? (
                  <img src={driver.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                    {driver.fullName.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Overlay Button */}
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <Camera size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'profile', driver, setDriver)}
                />
              </label>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">{driver.fullName}</h1>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                {isVerified ? <span className="text-green-600 font-bold">Verified Driver</span> : "Pending Approval"} 
                • {driver.email}
              </p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition flex items-center gap-2 text-sm font-bold">
            <LogOut size={20}/> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* LEFT: Availability Control */}
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
              {!isVerified ? "Account Locked" : isOnline ? "You are Online" : "You are Offline"}
            </p>
          </div>

          {/* RIGHT: Profile Settings & Car Photo */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Ride Details</h2>
              <span className="text-xs font-bold text-slate-400 uppercase">Update Info</span>
            </div>

            <div className="space-y-4">
              {/* Inputs */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Vehicle Model</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <Car size={18} className="text-slate-400"/>
                  <input className="bg-transparent w-full p-3 outline-none font-medium" placeholder="e.g. Maruti 800" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <Phone size={18} className="text-slate-400"/>
                  <input className="bg-transparent w-full p-3 outline-none font-medium" placeholder="e.g. 98630..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Routes</label>
                <div className="flex items-center bg-slate-50 rounded-xl px-4 border border-slate-200">
                  <MapPin size={18} className="text-slate-400"/>
                  <input className="bg-transparent w-full p-3 outline-none font-medium" placeholder="e.g. Shillong, Dawki" value={formData.routes} onChange={e => setFormData({...formData, routes: e.target.value})} />
                </div>
              </div>

              {/* CAR PHOTO UPLOADER */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Vehicle Photo</label>
                <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 group">
                  {driver.carPic ? (
                    <img src={driver.carPic} alt="Car" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <UploadCloud size={24} />
                      <span className="text-xs font-bold mt-1">Upload Car Photo</span>
                    </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold text-sm">
                    Click to Change
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'car', driver, setDriver)}
                    />
                  </label>
                </div>
              </div>

              {/* --- NEW: DRIVING LICENSE UPLOAD (AI POWERED) --- */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Driving License</label>
                  {driver.verificationStatus && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      driver.verificationStatus === 'Approved' ? 'bg-green-100 text-green-700' : 
                      driver.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {driver.verificationStatus}
                    </span>
                  )}
                </div>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden group">
                  
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingLicense ? (
                      <div className="text-blue-600 flex flex-col items-center font-medium">
                        <Loader2 size={28} className="animate-spin mb-2" />
                        <span className="animate-pulse text-sm">AI Scanning...</span>
                      </div>
                    ) : driver.licenseUrl ? (
                       <div className="text-green-600 flex flex-col items-center font-medium">
                         <FileText size={28} className="mb-2" />
                         <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition">Update License</span>
                       </div>
                    ) : (
                      <>
                        <FileText size={28} className="mb-2 text-slate-400" />
                        <p className="text-sm text-slate-500 font-bold mt-1">Upload License</p>
                        <p className="text-xs text-slate-400 mt-1">AI Auto-Verification</p>
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
              </div>

              <button onClick={() => handleUpdate()} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition flex items-center justify-center gap-2 mt-4">
                {isSaving ? "Saving..." : "Save Details"} <Save size={18}/>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER: HANDLE IMAGE UPLOAD ---
async function handleImageUpload(file, type, driver, setDriver) {
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', driver._id || driver.id);
  formData.append('type', type);

  try {
    const res = await fetch(`${API_BASE_URL}/driver/upload`, {
      method: 'POST',
      body: formData 
    });
    
    const data = await res.json();
    if (data.success) {
      setDriver(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`${type === 'profile' ? 'Profile' : 'Car'} photo updated!`);
    } else {
      alert("Upload failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during upload.");
  }
}