import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { INITIAL_LOCATIONS } from './utils/db';
import {
  calculateDistance,
  calculateLocationScore,
  getActiveWeatherWarning,
  rankLocations,
} from './utils/scoring';
import {
  addLocation,
  addReview,
  getLocations,
  getReviewsForLocation,
  upvoteLocation,
  verifyLocation,
} from './utils/storage';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

jest.mock('./engine', () => ({
  onScroll: () => () => {},
  startScroll: jest.fn(),
  stopScroll: jest.fn(),
}));

// Mock fetch so offline localStorage fallback runs deterministically in unit tests
beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() => Promise.reject(new Error('offline test mode')));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ViewPoint Functional Verification Suite (TC-01 to TC-08)', () => {
  test('TC-01: Bangalore Field Atlas seeds 21 locations (19 verified, 2 pending) across 3 categories', () => {
    expect(INITIAL_LOCATIONS).toHaveLength(21);
    const verified = INITIAL_LOCATIONS.filter((l) => l.verificationStatus === 'verified');
    const pending = INITIAL_LOCATIONS.filter((l) => l.verificationStatus === 'pending');
    expect(verified).toHaveLength(19);
    expect(pending).toHaveLength(2);

    const categories = new Set(INITIAL_LOCATIONS.map((l) => l.categoryId));
    expect(categories).toEqual(new Set(['cat_trekking', 'cat_abandoned', 'cat_historic']));
  });

  test('TC-02: Haversine distance computation recalculates accurately across Bangalore GPS presets', () => {
    const savandurga = INITIAL_LOCATIONS.find((l) => l.id === 'loc_savandurga');
    const mgRoad = { lat: 12.974, lng: 77.601 };
    const kengeri = { lat: 12.9004, lng: 77.4828 };

    const distFromMgRoad = calculateDistance(mgRoad.lat, mgRoad.lng, savandurga.lat, savandurga.lng);
    const distFromKengeri = calculateDistance(kengeri.lat, kengeri.lng, savandurga.lat, savandurga.lng);

    expect(distFromMgRoad).toBeGreaterThan(30);
    expect(distFromMgRoad).toBeLessThan(45);
    expect(distFromKengeri).toBeLessThan(distFromMgRoad);
  });

  test('TC-03 & TC-04: Climate-weighted scoring demotes steep granite hills and triggers warnings in monsoon/rain', () => {
    const savandurga = INITIAL_LOCATIONS.find((l) => l.id === 'loc_savandurga');
    const clayFactory = INITIAL_LOCATIONS.find((l) => l.name === 'Abandoned Clay Factory Ruins');
    const prefs = {
      currentLocation: { lat: 12.974, lng: 77.601 },
      preferredCategories: ['cat_trekking', 'cat_abandoned', 'cat_historic'],
      preferredDifficulty: 'medium',
      searchRadius: 90,
    };

    const winterClear = calculateLocationScore(savandurga, prefs, { season: 'winter', weather: 'sunny' });
    const monsoonRain = calculateLocationScore(savandurga, prefs, { season: 'monsoon', weather: 'rainy' });
    const monsoonCloudy = calculateLocationScore(savandurga, prefs, { season: 'monsoon', weather: 'overcast' });

    expect(winterClear.score).toBeGreaterThan(monsoonRain.score);
    expect(monsoonRain.breakdown.safetyPenalty).toBe(-40);
    expect(monsoonRain.warning).toMatch(/DANGEROUS|slippery/i);
    expect(getActiveWeatherWarning(savandurga, { season: 'monsoon', weather: 'overcast' })).toMatch(
      /DANGEROUS|slippery/i
    );
    expect(monsoonCloudy.breakdown.safetyPenalty).toBe(-40);

    const summerOvercast = rankLocations([savandurga, clayFactory], prefs, {
      season: 'summer',
      weather: 'overcast',
    });
    expect(summerOvercast[0].name).toBe('Abandoned Clay Factory Ruins');
    expect(summerOvercast[0].breakdown.proximity).toBeLessThanOrEqual(30);
    expect(summerOvercast[0].breakdown.difficulty).toBe(25);
    expect(summerOvercast[0].breakdown.category).toBe(20);
    expect(summerOvercast[0].breakdown.season).toBeLessThanOrEqual(25);
  });

  test('TC-05: Preferred difficulty matching awards 25/25 exact, 12/25 adjacent, and 0/25 mismatch', () => {
    const savandurga = INITIAL_LOCATIONS.find((l) => l.id === 'loc_savandurga'); // hard
    const basePrefs = {
      currentLocation: { lat: 12.974, lng: 77.601 },
      preferredCategories: ['cat_trekking'],
      searchRadius: 60,
    };
    const weather = { season: 'winter', weather: 'sunny' };

    expect(
      calculateLocationScore(savandurga, { ...basePrefs, preferredDifficulty: 'hard' }, weather).breakdown.difficulty
    ).toBe(25);
    expect(
      calculateLocationScore(savandurga, { ...basePrefs, preferredDifficulty: 'medium' }, weather).breakdown.difficulty
    ).toBe(12);
    expect(
      calculateLocationScore(savandurga, { ...basePrefs, preferredDifficulty: 'easy' }, weather).breakdown.difficulty
    ).toBe(0);
  });

  test('TC-06 & TC-07: Coordinate submission, verification, upvotes, and reviews persist cleanly', async () => {
    localStorage.setItem('viewpoint_locations', JSON.stringify(INITIAL_LOCATIONS));

    const created = await addLocation({
      name: 'Hessaraghatta Old Masonry Weir',
      categoryId: 'cat_abandoned',
      difficulty: 'easy',
      description: 'Quiet stone spillway near the lake bed.',
      lat: 13.1391,
      lng: 77.4785,
      verificationStatus: 'pending',
    });

    expect(created.verificationStatus).toBe('pending');
    expect(getLocations().some((l) => l.id === created.id)).toBe(true);

    const verified = await verifyLocation(created.id);
    expect(verified.verificationStatus).toBe('verified');

    const upvoted = await upvoteLocation(created.id);
    expect(upvoted.upvotes).toBe(1);

    addReview({
      locationId: created.id,
      userId: 'usr_001',
      rating: 5,
      comment: 'Clear trail access at sunrise.',
    });
    expect(getReviewsForLocation(created.id)).toHaveLength(1);
  });

  test('TC-08: Light/Dark mode switch in Navbar toggles html.dark class and persists preference', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /switch to dark display mode/i });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('viewpoint_theme')).toBe('dark');

    const lightToggleBtn = screen.getByRole('button', { name: /switch to light display mode/i });
    fireEvent.click(lightToggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('viewpoint_theme')).toBe('light');
  });
});
