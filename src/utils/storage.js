import { INITIAL_CATEGORIES, INITIAL_LOCATIONS, INITIAL_REVIEWS, INITIAL_USERS } from './db';

// LocalStorage Namespaces
const KEYS = {
  LOCATIONS: 'viewpoint_locations',
  CATEGORIES: 'viewpoint_categories',
  REVIEWS: 'viewpoint_reviews',
  USERS: 'viewpoint_users',
  ACTIVE_USER: 'viewpoint_active_user',
  WEATHER: 'viewpoint_weather',
  PREFERENCES: 'viewpoint_user_preferences'
};

// Initialize/Seed Database
export const seedDatabase = () => {
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  
  const storedLocations = localStorage.getItem(KEYS.LOCATIONS);
  if (!storedLocations || JSON.parse(storedLocations).length < INITIAL_LOCATIONS.length) {
    // Force overwrite to include ratings and new Day 2 trekking spots
    localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
  }

  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }

  const storedUsers = localStorage.getItem(KEYS.USERS);
  if (!storedUsers || !JSON.parse(storedUsers)[0]?.fullName) {
    // Update users store with Full Name & Theme properties
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  }

  if (!localStorage.getItem(KEYS.WEATHER)) {
    localStorage.setItem(KEYS.WEATHER, JSON.stringify({
      season: 'winter', // summer, monsoon, winter
      weather: 'sunny',  // sunny, rainy, overcast, misty
      temperature: '24°C'
    }));
  }
  if (!localStorage.getItem(KEYS.PREFERENCES)) {
    // Default preferences for Rohan
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify({
      userId: 'usr_001',
      preferredCategories: ['cat_trekking', 'cat_abandoned'],
      preferredDifficulty: 'medium',
      searchRadius: 60, // in km
      currentLocation: {
        lat: 12.9740, // Bangalore MG Road center
        lng: 77.6010
      }
    }));
  }
};

// Call seed immediately on import
seedDatabase();

// Locations CRUD
export const getLocations = () => {
  return JSON.parse(localStorage.getItem(KEYS.LOCATIONS)) || [];
};

export const saveLocations = (locations) => {
  localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(locations));
};

export const addLocation = (location) => {
  const locations = getLocations();
  const newLocation = {
    ...location,
    id: `loc_${Date.now()}`,
    upvotes: 0,
    verificationStatus: location.verificationStatus || 'pending',
    createdBy: location.createdBy || 'usr_001',
    images: location.images && location.images.length > 0 
      ? location.images 
      : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80']
  };
  locations.push(newLocation);
  saveLocations(locations);
  return newLocation;
};

export const upvoteLocation = (locationId) => {
  const locations = getLocations();
  const updated = locations.map(loc => {
    if (loc.id === locationId) {
      return { ...loc, upvotes: loc.upvotes + 1 };
    }
    return loc;
  });
  saveLocations(updated);
  return updated.find(loc => loc.id === locationId);
};

export const verifyLocation = (locationId) => {
  const locations = getLocations();
  const updated = locations.map(loc => {
    if (loc.id === locationId) {
      return { ...loc, verificationStatus: 'verified' };
    }
    return loc;
  });
  saveLocations(updated);
  return updated.find(loc => loc.id === locationId);
};

// Categories
export const getCategories = () => {
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
};

// Reviews
export const getReviews = () => {
  return JSON.parse(localStorage.getItem(KEYS.REVIEWS)) || [];
};

export const getReviewsForLocation = (locationId) => {
  const reviews = getReviews();
  return reviews.filter(rev => rev.locationId === locationId);
};

export const addReview = (review) => {
  const reviews = getReviews();
  const newReview = {
    ...review,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  reviews.push(newReview);
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  return newReview;
};

// Users
export const getUsers = () => {
  return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
};

export const getActiveUser = () => {
  return JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER));
};

export const setActiveUser = (user) => {
  if (user) {
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.ACTIVE_USER);
  }
};

// Weather
export const getWeather = () => {
  return JSON.parse(localStorage.getItem(KEYS.WEATHER)) || {
    season: 'winter',
    weather: 'sunny',
    temperature: '24°C'
  };
};

export const setWeather = (weather) => {
  localStorage.setItem(KEYS.WEATHER, JSON.stringify(weather));
  // Dispatch a custom event to notify components of weather change
  window.dispatchEvent(new Event('weatherChanged'));
};

// Preferences
export const getPreferences = () => {
  const activeUser = getActiveUser();
  const defaultPrefs = {
    userId: activeUser ? activeUser.id : 'guest',
    preferredCategories: ['cat_trekking', 'cat_abandoned', 'cat_historic'],
    preferredDifficulty: 'medium',
    searchRadius: 50,
    currentLocation: {
      lat: 12.9740,
      lng: 77.6010
    }
  };
  const prefs = JSON.parse(localStorage.getItem(KEYS.PREFERENCES));
  if (prefs && activeUser && prefs.userId === activeUser.id) {
    return prefs;
  }
  return defaultPrefs;
};

export const savePreferences = (preferences) => {
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
  window.dispatchEvent(new Event('preferencesChanged'));
};
