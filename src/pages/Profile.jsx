import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getLocations } from '../utils/storage';
import { User, Calendar, Award, Edit3, Save, MapPin, CheckCircle, ShieldAlert, Sun, Moon, Mail, Image } from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile, theme, toggleTheme } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userCreatedLocs, setUserCreatedLocs] = useState([]);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bioText, setBioText] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.username);
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setBioText(user.bio || '');
      
      const userLocs = getLocations().filter(loc => loc.createdBy === user.id);
      setUserCreatedLocs(userLocs);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-[70vh] flex flex-col items-center justify-center text-slate-900 dark:text-white px-4 font-sans transition-colors duration-300">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 text-center max-w-sm">You must be connected to an explorer node to view credentials.</p>
        <Link to="/login" className="bg-adventure-500 hover:bg-adventure-400 transition text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    if (!fullName.trim()) {
      setValidationError('Full Name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    
    setValidationError('');
    updateUserProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
      bio: bioText.trim()
    });
    setIsEditing(false);
  };

  const handleCycleAvatarSeed = () => {
    // Generate a random seed for the Dicebear avatar
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative transition-colors">
          
          {/* Theme switcher inside Profile card */}
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <img
              src={avatar || user.avatar}
              alt={user.username}
              className="h-24 w-24 rounded-full border-2 border-adventure-500 bg-slate-950 p-1 shadow-lg"
            />
            {isEditing && (
              <button
                type="button"
                onClick={handleCycleAvatarSeed}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 px-2 py-1 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cycle Avatar
              </button>
            )}
          </div>
          
          <div className="flex-grow text-center sm:text-left space-y-4">
            
            {/* View Mode */}
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
                  <h2 className="text-2xl font-extrabold">{fullName}</h2>
                  <span className="inline-flex items-center gap-1 self-center bg-adventure-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold text-adventure-500 dark:text-adventure-300 uppercase tracking-widest border border-adventure-500/30">
                    <Award className="h-3 w-3" />
                    {user.role} Node
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <User className="h-4 w-4 text-slate-400" />
                    @{user.username}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Joined: {user.joinedDate}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 max-w-xl text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Explorer Bio</span>
                    <button onClick={() => setIsEditing(true)} className="text-adventure-500 dark:text-adventure-400 hover:text-adventure-600 dark:hover:text-adventure-300 flex items-center gap-1 text-xs font-bold transition">
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{bioText || 'No bio written yet.'}"
                  </p>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <div className="space-y-4 text-left max-w-xl">
                <span className="block text-xs uppercase font-extrabold text-adventure-500 tracking-wider">Edit Node Credentials</span>
                
                {validationError && (
                  <div className="bg-red-950/20 border border-red-500/30 p-2.5 rounded-xl text-[10px] text-red-400">
                    {validationError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-adventure-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-adventure-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Avatar Image Link / Seed
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Provide image link or seed"
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-adventure-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Biography</label>
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl p-3 text-xs focus:outline-none focus:border-adventure-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setValidationError('');
                    }}
                    className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-adventure-500 hover:bg-adventure-400 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-adventure-900/10"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Discoveries Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">My Shared Discoveries</h3>
          
          {userCreatedLocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No spots mapped yet. Discovered a new path near Bangalore outskirts?
              <Link to="/add-location" className="block text-adventure-500 dark:text-adventure-400 hover:text-adventure-600 dark:hover:text-adventure-300 font-bold mt-2">
                Pin Your First Discovery
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userCreatedLocs.map(loc => (
                <div key={loc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex gap-4 items-center">
                  <img
                    src={loc.images[0]}
                    alt={loc.name}
                    className="h-16 w-16 rounded-xl object-cover bg-slate-950 flex-shrink-0"
                  />
                  <div className="flex-grow space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{loc.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> Lat: {loc.lat.toFixed(3)}, Lng: {loc.lng.toFixed(3)}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`inline-flex items-center gap-0.5 rounded text-[9px] font-bold px-1.5 py-0.5 ${
                        loc.verificationStatus === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {loc.verificationStatus === 'verified' ? <CheckCircle className="h-2 w-2" /> : null}
                        {loc.verificationStatus}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{loc.upvotes} Upvotes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
