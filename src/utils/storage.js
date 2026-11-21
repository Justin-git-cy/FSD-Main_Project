import { INITIAL_CATEGORIES, INITIAL_LOCATIONS, INITIAL_REVIEWS, INITIAL_USERS } from './db';
import { API_BASE } from './api';
import { rankLocations } from './scoring';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

// LocalStorage Namespaces
const KEYS = {
  LOCATIONS: 'viewpoint_locations',
  CATEGORIES: 'viewpoint_categories',
  REVIEWS: 'viewpoint_reviews',
  USERS: 'viewpoint_users',
  ACTIVE_USER: 'viewpoint_active_user',
  WEATHER: 'viewpoint_weather',
  PREFERENCES: 'viewpoint_user_preferences',
};

const CATEGORY_LABELS = {
  cat_trekking: 'Trekking & Hills',
  cat_abandoned: 'Abandoned & Ruins',
  cat_historic: 'Historic Sights',
};

export const normalizeLocation = (loc) => {
  if (!loc) return null;
  const catSlug = loc.category?.slug || '';
  const categoryId =
    loc.categoryId || (catSlug ? `cat_${catSlug}` : 'cat_trekking');
  const categoryName =
    loc.category?.name || CATEGORY_LABELS[categoryId] || 'Trail';

  const creatorObj = typeof loc.createdBy === 'object' && loc.createdBy !== null ? loc.createdBy : null;
  const createdById = creatorObj?._id || creatorObj?.id || (typeof loc.createdBy === 'string' ? loc.createdBy : 'usr_001');
  const createdByUsername = creatorObj?.username || loc.createdByUsername || (typeof loc.createdBy === 'string' ? loc.createdBy : 'rohan_trekker');
  const createdByName = creatorObj?.fullName || createdByUsername;

  const images =
    Array.isArray(loc.images) && loc.images.length > 0
      ? loc.images.filter(Boolean)
      : [DEFAULT_FALLBACK_IMAGE];

  return {
    ...loc,
    id: loc._id || loc.id,
    _id: loc._id || loc.id,
    categoryId,
    categoryName,
    createdBy: createdById,
    createdById,
    createdByUsername,
    createdByName,
    lat: Number(loc.lat),
    lng: Number(loc.lng),
    rating: Number(loc.rating || 4.0),
    upvotes: Number(loc.upvotes || 0),
    images,
    bestSeason: loc.bestSeason || 'Winter',
    difficulty: loc.difficulty || 'medium',
    verificationStatus: loc.verificationStatus || 'pending',
    seasonalSuitability: loc.seasonalSuitability || { summer: 0.5, monsoon: 0.5, winter: 0.8 },
    weatherWarnings: loc.weatherWarnings || {},
  };
};

// Initialize/Seed LocalStorage Fallback Database
export const seedDatabase = () => {
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }

  const storedLocations = localStorage.getItem(KEYS.LOCATIONS);
  if (!storedLocations || JSON.parse(storedLocations).length < INITIAL_LOCATIONS.length) {
    localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
  }

  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }

  const storedUsers = localStorage.getItem(KEYS.USERS);
  if (!storedUsers || !JSON.parse(storedUsers)[0]?.fullName) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  }

  if (!localStorage.getItem(KEYS.WEATHER)) {
    localStorage.setItem(
      KEYS.WEATHER,
      JSON.stringify({
        season: 'winter',
        weather: 'sunny',
        temperature: '24°C',
      })
    );
  }

  if (!localStorage.getItem(KEYS.PREFERENCES)) {
    localStorage.setItem(
      KEYS.PREFERENCES,
      JSON.stringify({
        userId: 'usr_001',
        preferredCategories: ['cat_trekking', 'cat_abandoned', 'cat_historic'],
        preferredDifficulty: 'medium',
        searchRadius: 60,
        currentLocation: {
          lat: 12.974,
          lng: 77.601,
        },
      })
    );
  }
};

seedDatabase();

// Locations CRUD & API Sync
export const getLocations = () => {
  const raw = JSON.parse(localStorage.getItem(KEYS.LOCATIONS)) || [];
  return raw.map(normalizeLocation).filter(Boolean);
};

export const saveLocations = (locations) => {
  localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(locations));
};

let inflightLocations = null;
export const fetchLocations = async () => {
  if (inflightLocations) return inflightLocations;
  inflightLocations = (async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(normalizeLocation).filter(Boolean);
          saveLocations(mapped);
          window.dispatchEvent(new CustomEvent('locationsUpdated', { detail: mapped }));
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Backend API sync notice:', err.message);
    } finally {
      inflightLocations = null;
    }
    return getLocations();
  })();
  return inflightLocations;
};

export const syncLocationsFromAPI = async () => fetchLocations();

// Initial sync on load
fetchLocations();

export const fetchLocationById = async (id) => {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE}/locations/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return normalizeLocation(json.data);
      }
    }
  } catch (err) {
    console.warn('fetchLocationById fallback:', err.message);
  }

  const all = await fetchLocations();
  const cleanId = String(id).toLowerCase().replace(/^loc_/, '');
  return (
    all.find(
      (l) =>
        l.id === id ||
        l._id === id ||
        l.name.toLowerCase().replace(/\s+/g, '-').includes(cleanId) ||
        l.name.toLowerCase().includes(cleanId)
    ) || null
  );
};

export const addLocation = async (location) => {
  const locations = getLocations();
  let created = null;

  try {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        created = normalizeLocation(json.data);
      }
    }
  } catch (e) {
    console.warn('Failed to add location to MongoDB:', e.message);
  }

  const finalLocation =
    created ||
    normalizeLocation({
      ...location,
      id: `loc_${Date.now()}`,
      upvotes: 0,
      verificationStatus: location.verificationStatus || 'pending',
      createdBy: location.createdBy || 'usr_001',
      images:
        location.images && location.images.length > 0
          ? location.images
          : [DEFAULT_FALLBACK_IMAGE],
    });

  const updated = [finalLocation, ...locations.filter((l) => l.id !== finalLocation.id)];
  saveLocations(updated);
  window.dispatchEvent(new CustomEvent('locationsUpdated', { detail: finalLocation }));
  window.dispatchEvent(new Event('storage'));
  return finalLocation;
};

export const upvoteLocation = async (locationId) => {
  const locations = getLocations();
  let updatedTarget = null;

  const optimistic = locations.map((loc) => {
    if (loc.id === locationId || loc._id === locationId) {
      updatedTarget = { ...loc, upvotes: (loc.upvotes || 0) + 1 };
      return updatedTarget;
    }
    return loc;
  });
  saveLocations(optimistic);

  try {
    const res = await fetch(`${API_BASE}/locations/${locationId}/upvote`, { method: 'PATCH' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const normalized = normalizeLocation(json.data);
        updatedTarget = normalized;
        const synced = optimistic.map((loc) =>
          loc.id === locationId || loc._id === locationId || loc.id === normalized.id
            ? normalized
            : loc
        );
        saveLocations(synced);
      }
    }
  } catch (e) {
    // offline fallback already saved
  }

  window.dispatchEvent(new CustomEvent('locationsUpdated'));
  window.dispatchEvent(new Event('storage'));
  return updatedTarget;
};

export const verifyLocation = async (locationId) => {
  const locations = getLocations();
  let updatedTarget = null;

  const optimistic = locations.map((loc) => {
    if (loc.id === locationId || loc._id === locationId) {
      updatedTarget = { ...loc, verificationStatus: 'verified' };
      return updatedTarget;
    }
    return loc;
  });
  saveLocations(optimistic);

  try {
    const res = await fetch(`${API_BASE}/locations/${locationId}/verify`, { method: 'PATCH' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const normalized = normalizeLocation(json.data);
        updatedTarget = normalized;
        const synced = optimistic.map((loc) =>
          loc.id === locationId || loc._id === locationId || loc.id === normalized.id
            ? normalized
            : loc
        );
        saveLocations(synced);
      }
    }
  } catch (e) {
    // offline fallback already saved
  }

  window.dispatchEvent(new CustomEvent('locationsUpdated'));
  window.dispatchEvent(new Event('storage'));
  return updatedTarget;
};

// Recommendations (Server-side scoring with client fallback)
export const fetchRecommendations = async (preferences, weather) => {
  try {
    const res = await fetch(`${API_BASE}/locations/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences, weather }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map((item) => ({
          ...normalizeLocation(item),
          score: item.score,
          distance: item.distance,
          breakdown: item.breakdown,
          warning: item.warning || null,
        }));
      }
    }
  } catch (err) {
    console.warn('Recommendations API fallback to local scoring:', err.message);
  }

  const all = await fetchLocations();
  return rankLocations(
    all.filter((l) => l.verificationStatus === 'verified'),
    preferences,
    weather
  );
};

// Categories
export const getCategories = () => {
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || [];
};

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((cat) => ({
          id: cat.slug ? `cat_${cat.slug}` : cat._id,
          mongoId: cat._id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
        }));
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('fetchCategories fallback:', err.message);
  }
  return getCategories();
};

// Reviews
export const getReviews = () => {
  return JSON.parse(localStorage.getItem(KEYS.REVIEWS)) || [];
};

export const getReviewsForLocation = (locationId) => {
  const reviews = getReviews();
  return reviews.filter((rev) => rev.locationId === locationId || rev.location === locationId);
};

export const fetchReviewsForLocation = async (locationId) => {
  try {
    const res = await fetch(`${API_BASE}/reviews?locationId=${encodeURIComponent(locationId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('fetchReviewsForLocation fallback:', err.message);
  }
  return getReviewsForLocation(locationId);
};

export const fetchReviewsByUser = async (userId) => {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_BASE}/reviews?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('fetchReviewsByUser fallback:', err.message);
  }
  return getReviews().filter((rev) => rev.userId === userId || rev.user === userId);
};

export const addReview = (review) => {
  const reviews = getReviews();
  const newReview = {
    ...review,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  return newReview;
};

export const submitReview = async ({ location, user, rating, comment }) => {
  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, user, rating: Number(rating), comment }),
    });
    const json = await res.json();
    if (res.ok && json.success && json.data) {
      window.dispatchEvent(new CustomEvent('reviewsUpdated'));
      await fetchLocations();
      return { success: true, data: json.data };
    }
    return { success: false, message: json.message || 'Unable to save review' };
  } catch (err) {
    const localRev = addReview({
      locationId: location,
      userId: user,
      rating: Number(rating),
      comment,
    });
    window.dispatchEvent(new CustomEvent('reviewsUpdated'));
    return { success: true, data: localRev, offline: true };
  }
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
  return (
    JSON.parse(localStorage.getItem(KEYS.WEATHER)) || {
      season: 'winter',
      weather: 'sunny',
      temperature: '24°C',
    }
  );
};

export const setWeather = (weather) => {
  localStorage.setItem(KEYS.WEATHER, JSON.stringify(weather));
  window.dispatchEvent(new Event('weatherChanged'));
};

// Preferences
export const getPreferences = () => {
  const activeUser = getActiveUser();
  const defaultPrefs = {
    userId: activeUser ? activeUser.id || activeUser._id : 'guest',
    preferredCategories: ['cat_trekking', 'cat_abandoned', 'cat_historic'],
    preferredDifficulty: 'medium',
    searchRadius: 60,
    currentLocation: {
      lat: 12.974,
      lng: 77.601,
    },
  };
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS.PREFERENCES));
    if (saved && typeof saved === 'object') {
      return {
        ...defaultPrefs,
        ...saved,
        currentLocation: {
          ...defaultPrefs.currentLocation,
          ...(saved.currentLocation || {}),
        },
        preferredCategories:
          Array.isArray(saved.preferredCategories) && saved.preferredCategories.length > 0
            ? saved.preferredCategories
            : defaultPrefs.preferredCategories,
      };
    }
  } catch (e) {
    // ignore corrupt JSON
  }
  return defaultPrefs;
};

export const savePreferences = (preferences) => {
  const activeUser = getActiveUser();
  const merged = {
    ...getPreferences(),
    ...preferences,
    userId: activeUser ? activeUser.id || activeUser._id : preferences.userId || 'guest',
  };
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(merged));
  window.dispatchEvent(new Event('preferencesChanged'));
  return merged;
};
