import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserCheck, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (nameToLogin) => {
    const finalName = nameToLogin || username;
    if (!finalName.trim()) return;
    
    login(finalName);
    navigate('/profile');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-[80vh] flex items-center justify-center px-4 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl transition-colors">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-adventure-500/10 text-adventure-500 dark:text-adventure-400 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Sign In to ViewPoint</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">Access unmapped locations and verify adventure trails.</p>
        </div>

        {/* Current Session Indicator */}
        {user && (
          <div className="mb-6 flex items-center gap-3 bg-adventure-500/10 border border-adventure-500/30 p-3.5 rounded-2xl text-xs text-adventure-700 dark:text-adventure-300">
            <UserCheck className="h-5 w-5 text-adventure-550 dark:text-adventure-400 flex-shrink-0" />
            <div>
              Active Session: <span className="font-bold text-slate-900 dark:text-white">{user.username}</span> ({user.role} role). Navigating to profile...
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
              Explorer Username / Email
            </label>
            <input
              type="text"
              placeholder="e.g. rohan_trekker or guest_explorer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-adventure-500 transition-colors"
            />
          </div>

          <button
            onClick={() => handleLogin()}
            disabled={!username.trim()}
            className="w-full bg-adventure-500 hover:bg-adventure-400 transition-all text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-adventure-900/20"
          >
            <LogIn className="h-4 w-4" />
            <span>Connect Explorer Node</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold tracking-widest">Or Demo Profiles</span></div>
        </div>

        {/* Quick Demo Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLogin('rohan_trekker')}
            className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition rounded-xl p-3.5 text-left flex flex-col justify-between"
          >
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=rohan"
              alt="Rohan"
              className="h-8 w-8 rounded-full border border-adventure-500/50 bg-slate-100 dark:bg-slate-900 mb-2.5"
            />
            <div>
              <span className="block text-xs font-bold">Rohan (Pathfinder)</span>
              <span className="text-[10px] text-adventure-600 dark:text-adventure-400 font-semibold uppercase">Can Verify Sights</span>
            </div>
          </button>

          <button
            onClick={() => handleLogin('neha_explores')}
            className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 transition rounded-xl p-3.5 text-left flex flex-col justify-between"
          >
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=neha"
              alt="Neha"
              className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 mb-2.5"
            />
            <div>
              <span className="block text-xs font-bold">Neha (Explorer)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Can View Sights</span>
            </div>
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-250 dark:border-slate-800/85 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <ShieldAlert className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span>Note: Any username typed will create a new Explorer profile cached in your localStorage. No password is required.</span>
        </div>
      </div>
    </div>
  );
}
