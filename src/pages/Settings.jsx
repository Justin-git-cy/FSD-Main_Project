import React, { useState, useEffect } from 'react';
import { getPreferences, savePreferences, getActiveUser } from '../utils/storage';
import { Settings as SettingsIcon, Navigation, ShieldCheck, MapPin, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_COORDS = [
  { name: 'Bangalore Center (MG Road)', lat: 12.9740, lng: 77.6010 },
  { name: 'Whitefield (East Bangalore)', lat: 12.9698, lng: 77.7499 },
  { name: 'Yelahanka (North Bangalore)', lat: 13.1007, lng: 77.5963 },
  { name: 'Kengeri (Southwest Bangalore)', lat: 12.9004, lng: 77.4828 },
  { name: 'Nelamangala (Northwest Bangalore)', lat: 13.0964, lng: 77.3912 }
];

export default function Settings() {
  const [preferences, setPrefs] = useState({
    searchRadius: 50,
    currentLocation: { lat: 12.9740, lng: 77.6010 }
  });
  
  const [latInput, setLatInput] = useState('12.9740');
  const [lngInput, setLngInput] = useState('77.6010');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const activePrefs = getPreferences();
    setPrefs(activePrefs);
    setLatInput(activePrefs.currentLocation.lat.toString());
    setLngInput(activePrefs.currentLocation.lng.toString());
  }, []);

  const handleSelectPredefined = (item) => {
    setLatInput(item.lat.toString());
    setLngInput(item.lng.toString());
    
    const updated = {
      ...preferences,
      currentLocation: { lat: item.lat, lng: item.lng }
    };
    setPrefs(updated);
    savePreferences(updated);
    triggerNotice('Coordinates simulated: ' + item.name);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numerical coordinates.');
      return;
    }

    const updated = {
      ...preferences,
      currentLocation: { lat, lng }
    };
    setPrefs(updated);
    savePreferences(updated);
    triggerNotice('Custom coordinates saved successfully.');
  };

  const handleRadiusChange = (e) => {
    const radius = parseInt(e.target.value);
    const updated = {
      ...preferences,
      searchRadius: radius
    };
    setPrefs(updated);
    savePreferences(updated);
    triggerNotice(`Search radius updated to ${radius} km.`);
  };

  const triggerNotice = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const activeUser = getActiveUser();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-adventure-500/10 rounded-2xl flex items-center justify-center text-adventure-500 dark:text-adventure-400">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Explorer Simulation Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simulate navigation coordinates to verify distance calculations in our scoring engine.</p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Preset Coordinates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 md:col-span-2 transition-colors">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400 flex items-center gap-1">
              <Navigation className="h-4 w-4 text-adventure-500 dark:text-adventure-400" />
              Simulated Location Presets
            </h3>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Click a preset below to instantly warp your explorer coordinates. This affects distances shown on the Explore page and rankings on Recommendations.
            </p>

            <div className="space-y-2 pt-2">
              {MOCK_COORDS.map((item, idx) => {
                const isSelected = 
                  Math.abs(preferences.currentLocation.lat - item.lat) < 0.001 &&
                  Math.abs(preferences.currentLocation.lng - item.lng) < 0.001;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPredefined(item)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                      isSelected 
                        ? 'bg-adventure-500/10 border-adventure-500 font-bold text-slate-900 dark:text-white shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Coordinates Form */}
            <form onSubmit={handleSaveCustom} className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400">Or Input Custom Coordinates</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-950 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-adventure-500 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-950 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-adventure-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Save className="h-3.5 w-3.5 text-adventure-500 dark:text-adventure-400" />
                <span>Save Custom Coordinate Node</span>
              </button>
            </form>
          </div>

          {/* Right Column: Search Radius & Meta */}
          <div className="space-y-6">
            
            {/* Search Radius settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 transition-colors">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400">Search Radius</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Determine the maximum boundary for nearby trekking recommendations.
              </p>
              
              <div className="pt-2">
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={preferences.searchRadius}
                  onChange={handleRadiusChange}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-adventure-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>20 km</span>
                  <span className="text-adventure-650 dark:text-adventure-400 font-bold">{preferences.searchRadius} km active</span>
                  <span>120 km</span>
                </div>
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 transition-colors">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400">Explorer Profile</h3>
              {activeUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeUser.avatar}
                      alt="avatar"
                      className="h-8 w-8 rounded-full border border-adventure-500 bg-slate-100 dark:bg-slate-950 p-0.5"
                    />
                    <div>
                      <span className="block text-xs font-bold leading-none">{activeUser.username}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-adventure-600 dark:text-adventure-400 mt-0.5 block">{activeUser.role} credentials</span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block text-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-lg py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    View Biography Profile
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Not logged in.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
