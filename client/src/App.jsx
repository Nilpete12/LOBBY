import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import Footer from './Components/Footer';
import ErrorPage from './Pages/Error';
import Sign from './Pages/Sign';
import Findride from './Pages/Findride';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/Auth" element={<Sign />} />
            <Route path="/search" element={<Findride />} />
            
            
          </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;