import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import the helper
import Scrolltotop from './Components/Scrolltotop';
import { AuthProvider } from './context/Authcontext'; 

// Structure Components
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

// Pages
import Home from './Pages/Home';
import Sign from './Pages/Sign';
import Findride from './Pages/Findride';
import Support from './Pages/Support';
import Driverpage from './Pages/Driverpage';
import AdminPage from './Pages/Adminpage';
import ErrorPage from './Pages/Error';
import PrivacyPolicy from './Pages/Privacypolicy';
import TermsPage from './Pages/Terms';
import DriverDashboard from './Pages/Driverdashboard';

// --- LAYOUT COMPONENT (Handles the Logic) ---
function Layout() {
  const location = useLocation();
  
  // check if the current path starts with "/admin"
  const isAdmin = location.pathname.startsWith('/admin');

  // check if we are on the auth page (optional: to hide nav on login too)
  // const isAuth = location.pathname === '/auth'; 

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased flex flex-col">
      
      {/* Conditionally render Navbar */}
      {!isAdmin && <Navbar />}
      
      <main className={`grow ${isAdmin ? '' : ''}`}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/Auth" element={<Sign />} />
            <Route path="/search" element={<Findride />} />
            <Route path="/Support" element={<Support />} />
            <Route path="/Drive" element={<Driverpage />} />
            <Route path="/Drive/Dashboard" element={<DriverDashboard />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/T&C" element={<TermsPage />} />
        </Routes>
      </main>

      {/* Conditionally render Footer */}
      {!isAdmin && <Footer />} 
    
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Scrolltotop />
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;