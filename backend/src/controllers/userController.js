const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
});

// @desc    Login / Register user (find or create)
// @route   POST /api/users/login
exports.loginUser = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  const formattedUsername = username.trim().toLowerCase();

  // Find existing user by username or email prefix
  let user = await User.findOne({
    $or: [
      { username: formattedUsername },
      { email: { $regex: `^${formattedUsername}@`, $options: 'i' } },
    ],
  });

  if (!user) {
    // Create new user
    user = await User.create({
      username: formattedUsername,
      fullName: username.trim(),
      email: `${formattedUsername}@viewpoint.com`,
      role: 'Explorer',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.trim()}`,
      bio: 'New explorer eager to map Bangalore outskirts.',
    });
  }

  res.status(200).json(new ApiResponse(200, user, 'Login successful'));
});

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'email', 'avatar', 'bio', 'theme'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

