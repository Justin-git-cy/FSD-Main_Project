const { Location } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { calculateLocationScore } = require('../utils/scoring');

// @desc    Get all locations (with optional filters)
// @route   GET /api/locations
// @query   ?category=<id>&status=verified|pending&search=<text>&sort=upvotes|name
exports.getLocations = asyncHandler(async (req, res) => {
  const { category, status, search, sort } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.verificationStatus = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  let sortOption = { upvotes: -1 }; // default: most upvoted
  if (sort === 'name') sortOption = { name: 1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const locations = await Location.find(filter)
    .populate('category', 'name slug icon')
    .populate('createdBy', 'username fullName avatar role')
    .sort(sortOption);

  res.status(200).json(new ApiResponse(200, locations, 'Locations fetched successfully'));
});

// @desc    Get single location by ID
// @route   GET /api/locations/:id
exports.getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id)
    .populate('category', 'name slug icon')
    .populate('createdBy', 'username fullName avatar role');

  if (!location) throw new ApiError(404, 'Location not found');
  res.status(200).json(new ApiResponse(200, location, 'Location fetched successfully'));
});

// @desc    Create a new location
// @route   POST /api/locations
exports.createLocation = asyncHandler(async (req, res) => {
  const {
    name, description, category, difficulty,
    lat, lng, images, bestSeason,
    seasonalSuitability, weatherWarnings, createdBy,
  } = req.body;

  const location = await Location.create({
    name,
    description,
    category,
    difficulty,
    lat,
    lng,
    images: images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'],
    bestSeason,
    seasonalSuitability,
    weatherWarnings,
    createdBy,
    rating: 4.0,
    upvotes: 0,
  });

  const populated = await Location.findById(location._id)
    .populate('category', 'name slug icon')
    .populate('createdBy', 'username fullName avatar role');

  res.status(201).json(new ApiResponse(201, populated, 'Location created successfully'));
});

// @desc    Upvote a location
// @route   PATCH /api/locations/:id/upvote
exports.upvoteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findByIdAndUpdate(
    req.params.id,
    { $inc: { upvotes: 1 } },
    { new: true }
  ).populate('category', 'name slug icon');

  if (!location) throw new ApiError(404, 'Location not found');
  res.status(200).json(new ApiResponse(200, location, 'Upvote recorded'));
});

// @desc    Verify a location (Pathfinder only)
// @route   PATCH /api/locations/:id/verify
exports.verifyLocation = asyncHandler(async (req, res) => {
  const location = await Location.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: 'verified' },
    { new: true }
  ).populate('category', 'name slug icon');

  if (!location) throw new ApiError(404, 'Location not found');
  res.status(200).json(new ApiResponse(200, location, 'Location verified'));
});

// @desc    Get recommended locations based on user preferences + weather
// @route   POST /api/locations/recommendations
// @body    { preferences: {...}, weather: {...} }
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { preferences, weather } = req.body;

  if (!preferences || !weather) {
    throw new ApiError(400, 'Preferences and weather data are required');
  }

  const locations = await Location.find({ verificationStatus: 'verified' })
    .populate('category', 'name slug icon')
    .populate('createdBy', 'username fullName avatar role');

  const scored = locations
    .map((loc) => {
      const locObj = loc.toObject();
      const scoring = calculateLocationScore(locObj, preferences, weather);
      return { ...locObj, ...scoring };
    })
    .sort((a, b) => b.score - a.score);

  res.status(200).json(new ApiResponse(200, scored, 'Recommendations generated'));
});

