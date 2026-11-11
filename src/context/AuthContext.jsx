import React, { createContext, useState, useEffect, useContext } from 'react';
import { getActiveUser, setActiveUser, getUsers } from '../utils/storage';
import { API_BASE } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [theme, setTheme] = useState('dark');

  // Sync theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Load initial user state
    const currentUser = getActiveUser();
    setUser(currentUser);
    setUsers(getUsers());
    if (currentUser && currentUser.theme) {
      setTheme(currentUser.theme);
    } else {
      setTheme('dark'); // default theme
    }

    // Sync users from MongoDB backend
    fetch(`${API_BASE}/users`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const mappedUsers = data.data.map((u) => ({
            ...u,
            id: u._id || u.id,
          }));
          setUsers(mappedUsers);
          localStorage.setItem('viewpoint_users', JSON.stringify(mappedUsers));
          console.log('✅ [MongoDB API] Synced users:', mappedUsers.length);
        }
      })
      .catch((err) => {
        console.warn('⚠️ [MongoDB API] Could not sync users (backend not reachable):', err.message);
      });
  }, []);

  const login = async (username) => {
    const formattedUsername = username.trim().toLowerCase();
    console.log(`📡 [MongoDB API] Calling ${API_BASE}/users/login for: "${formattedUsername}"`);

    // 1. Authenticate / Create in MongoDB via Backend API
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formattedUsername }),
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        console.log('✅ [MongoDB API] User stored in MongoDB Atlas:', data.data);
        const mongoUser = {
          ...data.data,
          id: data.data._id || data.data.id,
        };

        const allUsers = getUsers();
        const existingIdx = allUsers.findIndex(
          (u) => u.username.toLowerCase() === formattedUsername || (u.id && u.id === mongoUser.id)
        );
        const updatedUsers =
          existingIdx >= 0
            ? allUsers.map((u, i) => (i === existingIdx ? mongoUser : u))
            : [...allUsers, mongoUser];

        localStorage.setItem('viewpoint_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setActiveUser(mongoUser);
        setUser(mongoUser);
        if (mongoUser.theme) setTheme(mongoUser.theme);
        return mongoUser;
      }
    } catch (err) {
      console.error('❌ [MongoDB API] Login request failed:', err.message);
      console.warn('Make sure backend is running on http://localhost:5000 (run: npm run dev)');
    }

    // 2. Offline / local fallback
    const allUsers = getUsers();
    let foundUser = allUsers.find(
      (u) => u.username.toLowerCase() === formattedUsername || u.email.toLowerCase().startsWith(formattedUsername)
    );

    if (!foundUser) {
      foundUser = {
        id: `usr_${Date.now()}`,
        username: username.trim(),
        fullName: username.trim(),
        email: `${username.trim().toLowerCase()}@viewpoint.com`,
        role: 'Explorer',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.trim()}`,
        bio: 'New explorer eager to map Bangalore outskirts.',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        theme: 'dark',
      };
      const updatedUsers = [...allUsers, foundUser];
      localStorage.setItem('viewpoint_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }

    setActiveUser(foundUser);
    setUser(foundUser);
    if (foundUser.theme) setTheme(foundUser.theme);
    return foundUser;
  };

  const logout = () => {
    setActiveUser(null);
    setUser(null);
    setTheme('dark'); // reset to default
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updates,
    };

    // Update state immediately
    setUser(updatedUser);
    setActiveUser(updatedUser);
    if (updates.theme) setTheme(updates.theme);

    const allUsers = getUsers();
    const updatedUsers = allUsers.map((u) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem('viewpoint_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Sync to MongoDB
    const userId = user._id || user.id;
    if (userId) {
      try {
        await fetch(`${API_BASE}/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (err) {
        console.warn('Profile update sync warning:', err.message);
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      updateUserProfile({ theme: nextTheme });
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, theme, login, logout, updateUserProfile, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
