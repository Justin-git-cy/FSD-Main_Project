const { Review, Location } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get reviews for a location
// @route   GET /api/reviews?locationId=<id>
exports.getReviews = asyncHandler(async (req, res) => {
  const { locationId } = req.query;
  const filter = {};
  if (locationId) filter.location = locationId;

  const reviews = await Review.find(filter)
    .populate('user', 'username fullName avatar role')
    .populate('location', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});

// @desc    Add a review
// @route   POST /api/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { location, user, rating, comment } = req.body;

  // Verify location exists
  const loc = await Location.findById(location);
  if (!loc) throw new ApiError(404, 'Location not found');

  const review = await Review.create({ location, user, rating, comment });

  // Recalculate average rating for the location
  const allReviews = await Review.find({ location });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await Location.findByIdAndUpdate(location, {
    rating: Math.round(avgRating * 10) / 10,
  });

  const populated = await Review.findById(review._id)
    .populate('user', 'username fullName avatar role')
    .populate('location', 'name');

  res.status(201).json(new ApiResponse(201, populated, 'Review added successfully'));
});

