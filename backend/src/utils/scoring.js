/**
 * Haversine formula to calculate distance in km between two geo-coordinates.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Computes recommendation score for a location based on user preferences and weather.
 */
const calculateLocationScore = (location, preferences, weather) => {
  const { currentLocation, preferredCategories, preferredDifficulty, searchRadius } = preferences;
  const { season, weather: weatherCondition } = weather;

  const scoreBreakdown = {
    proximity: 0,
    difficulty: 0,
    category: 0,
    season: 0,
    safetyPenalty: 0,
  };

  // 1. Proximity Score (Max 30 pts)
  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    location.lat,
    location.lng
  );

  if (distance <= 5) {
    scoreBreakdown.proximity = 30;
  } else if (distance <= searchRadius) {
    const ratio = (distance - 5) / (searchRadius - 5);
    scoreBreakdown.proximity = Math.round(30 - ratio * 25);
  } else {
    scoreBreakdown.proximity = Math.max(0, Math.round(5 - (distance - searchRadius) / 10));
  }

  // 2. Difficulty Match Score (Max 25 pts)
  const difficultyMapping = { easy: 1, medium: 2, hard: 3 };
  const prefDiffVal = difficultyMapping[preferredDifficulty] || 2;
  const locDiffVal = difficultyMapping[location.difficulty] || 2;
  const diffDiff = Math.abs(prefDiffVal - locDiffVal);

  if (diffDiff === 0) scoreBreakdown.difficulty = 25;
  else if (diffDiff === 1) scoreBreakdown.difficulty = 12;
  else scoreBreakdown.difficulty = 0;

  // 3. Category Preference (Max 20 pts)
  const categoryId = location.category?._id?.toString() || location.category?.toString();
  if (preferredCategories && preferredCategories.includes(categoryId)) {
    scoreBreakdown.category = 20;
  }

  // 4. Seasonal Suitability (Max 25 pts)
  const seasonSuitability =
    location.seasonalSuitability?.[season] !== undefined
      ? location.seasonalSuitability[season]
      : 0.5;
  scoreBreakdown.season = Math.round(25 * seasonSuitability);

  // 5. Weather Warning Safety Penalty
  const warningsObj = location.weatherWarnings instanceof Map
    ? Object.fromEntries(location.weatherWarnings)
    : location.weatherWarnings || {};
  const warning = warningsObj[weatherCondition];
  if (warning) {
    if (warning.includes('DANGEROUS') || warning.includes('CRITICAL')) {
      scoreBreakdown.safetyPenalty = -40;
    } else if (warning.includes('WARNING') || warning.includes('CAUTION')) {
      scoreBreakdown.safetyPenalty = -15;
    }
  }

  const rawScore =
    scoreBreakdown.proximity +
    scoreBreakdown.difficulty +
    scoreBreakdown.category +
    scoreBreakdown.season +
    scoreBreakdown.safetyPenalty;

  const finalScore = Math.max(0, Math.min(100, rawScore));

  return {
    score: finalScore,
    distance: Math.round(distance * 10) / 10,
    breakdown: scoreBreakdown,
    warning: warning || null,
  };
};

module.exports = { calculateDistance, calculateLocationScore };

