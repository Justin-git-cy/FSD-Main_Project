import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AddLocation from './pages/AddLocation';
import Explore from './pages/Explore';
import Trending from './pages/Trending';
import Settings from './pages/Settings';
import Recommendations from './pages/Recommendations';
import Preferences from './pages/Preferences';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-adventure-500/30 selection:text-white transition-colors duration-300">
      {/* Global Navigation Header (includes Weather Simulator and Marquee) */}
      <Navbar />

      {/* Main Container Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-location" element={<AddLocation />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/preferences" element={<Preferences />} />
          {/* Catch-all route redirecting back to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer (includes Safety Guidelines and Navigation Engine summaries) */}
      <Footer />
    </div>
  );
}

export default App;
