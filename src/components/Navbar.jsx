import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, TrendingUp, PlusCircle, User, Settings, LogOut, LogIn, Sparkles, Menu, X, Award } from 'lucide-react';
import WeatherSimulator from './WeatherSimulator';
import Marquee from './Marquee';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Explore Map', path: '/explore', icon: Compass },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Share Spot', path: '/add-location', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
      {/* Main Top Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-adventure-500 text-white font-bold text-xl shadow-lg shadow-adventure-900/50">
            VP
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-adventure-300 to-emerald-400 bg-clip-text text-transparent">
              ViewPoint
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold -mt-1">
              Bangalore Outskirts
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-adventure-500 text-white shadow-md shadow-adventure-900/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop User Panel */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-95 group">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-9 w-9 rounded-full bg-slate-800 p-0.5 border border-adventure-500/50 group-hover:border-adventure-400 transition"
                />
                <div className="text-left">
                  <span className="block text-sm font-semibold leading-none group-hover:text-adventure-300 transition">
                    {user.username}
                  </span>
                  <span className="inline-flex items-center gap-0.5 mt-0.5 rounded bg-adventure-500/20 px-1 text-[9px] font-bold text-adventure-300 uppercase tracking-wider">
                    <Award className="h-2 w-2" />
                    {user.role}
                  </span>
                </div>
              </Link>
              
              <Link
                to="/settings"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-adventure-500 hover:bg-adventure-400 transition px-4 py-2 text-sm font-bold text-white shadow-md shadow-adventure-900/30"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <img
                src={user.avatar}
                alt={user.username}
                className="h-8 w-8 rounded-full border border-adventure-500 bg-slate-800 p-0.5"
              />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <hr className="border-slate-800 my-2" />
          {user ? (
            <div className="space-y-1">
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold text-red-400 hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg bg-adventure-600 px-3 py-2.5 text-center font-bold text-white hover:bg-adventure-500"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}

      {/* Weather Simulation Control Panel */}
      <WeatherSimulator />

      {/* Real-time Ticker / Marquee */}
      <Marquee />
    </header>
  );
}
