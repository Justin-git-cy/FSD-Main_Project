import React, { createContext, useState, useEffect, useContext } from 'react';
import { getActiveUser, setActiveUser, getUsers } from '../utils/storage';

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
  }, []);

  const login = (username) => {
    const allUsers = getUsers();
    const formattedUsername = username.trim().toLowerCase();
    
    // Find matching user
    let foundUser = allUsers.find(
      u => u.username.toLowerCase() === formattedUsername || u.email.toLowerCase().startsWith(formattedUsername)
    );

    if (!foundUser) {
      // Create new user if not found
      foundUser = {
        id: `usr_${Date.now()}`,
        username: username.trim(),
        fullName: username.trim(),
        email: `${username.trim().toLowerCase()}@viewpoint.com`,
        role: 'Explorer', // Default new users to Explorer
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.trim()}`,
        bio: 'New explorer eager to map Bangalore outskirts.',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        theme: 'dark'
      };
      
      // Save new user
      const updatedUsers = [...allUsers, foundUser];
      localStorage.setItem('viewpoint_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }

    setActiveUser(foundUser);
    setUser(foundUser);
    if (foundUser.theme) {
      setTheme(foundUser.theme);
    }
    return foundUser;
  };

  const logout = () => {
    setActiveUser(null);
    setUser(null);
    setTheme('dark'); // reset to default
  };

  const updateUserProfile = (updates) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...updates
    };

    // Update states
    setUser(updatedUser);
    setActiveUser(updatedUser);
    
    if (updates.theme) {
      setTheme(updates.theme);
    }

    // Update in users database
    const allUsers = getUsers();
    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem('viewpoint_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
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
