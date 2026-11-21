const mongoose = require('mongoose');
const { Review, Location, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get reviews for a location or by a user
// @route   GET /api/reviews?locationId=<id>&userId=<id>
exports.getReviews = asyncHandler(async (req, res) => {
  const { locationId, userId } = req.query;
  const filter = {};
  if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
    filter.location = locationId;
  }
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    } else {
      const userDoc = await User.findOne({ username: String(userId).toLowerCase() });
      if (userDoc) filter.user = userDoc._id;
    }
  }

  const reviews = await Review.find(filter)
    .populate('user', 'username fullName avatar role')
    .populate('location', 'name difficulty bestSeason')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});

// @desc    Add or update a review for a location
// @route   POST /api/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { location, user, rating, comment } = req.body;

  if (!location || !rating || !comment || !comment.trim()) {
    throw new ApiError(400, 'Location, rating, and comment are required');
  }

  // Verify location exists (ObjectId or fallback name)
  let loc = null;
  if (mongoose.Types.ObjectId.isValid(location)) {
    loc = await Location.findById(location);
  } else {
    const cleanQuery = String(location).replace(/^loc_/, '').replace(/[-_]+/g, ' ').trim();
    loc = await Location.findOne({ name: { $regex: cleanQuery, $options: 'i' } });
  }
  if (!loc) throw new ApiError(404, 'Location not found');

  // Resolve user ObjectId
  let resolvedUserId = null;
  if (user && mongoose.Types.ObjectId.isValid(user)) {
    resolvedUserId = user;
  } else if (user) {
    const foundUser = await User.findOne({ username: String(user).toLowerCase() });
    if (foundUser) resolvedUserId = foundUser._id;
  }
  if (!resolvedUserId) {
    throw new ApiError(400, 'Valid explorer user account is required to submit a field note');
  }

  const review = await Review.findOneAndUpdate(
    { location: loc._id, user: resolvedUserId },
    { rating: Number(rating), comment: comment.trim() },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Recalculate average rating for the location
  const allReviews = await Review.find({ location: loc._id });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await Location.findByIdAndUpdate(loc._id, {
    rating: Math.round(avgRating * 10) / 10,
  });

  const populated = await Review.findById(review._id)
    .populate('user', 'username fullName avatar role')
    .populate('location', 'name difficulty bestSeason');

  res.status(201).json(new ApiResponse(201, populated, 'Review saved successfully'));
});

