const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['Explorer', 'Pathfinder', 'Admin'],
      default: 'Explorer',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for joinedDate display string
userSchema.virtual('joinedDate').get(function () {
  if (!this.createdAt) return null;
  return this.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

