import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RouteTransition } from './engine';

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
import LocationDetail from './pages/LocationDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="vp-app-shell">
      <a className="global-skip-link" href="#main-content">Skip to content</a>
      <RouteTransition />
      <Navbar />

      <main id="main-content" className="vp-main" tabIndex="-1">
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
          <Route path="/location/:id" element={<LocationDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
