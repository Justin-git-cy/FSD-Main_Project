const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    seasonalSuitability: {
      summer: { type: Number, default: 0.5, min: 0, max: 1 },
      monsoon: { type: Number, default: 0.5, min: 0, max: 1 },
      winter: { type: Number, default: 0.5, min: 0, max: 1 },
    },
    bestSeason: {
      type: String,
      enum: ['Summer', 'Monsoon', 'Winter'],
      default: 'Winter',
    },
    weatherWarnings: {
      type: Map,
      of: String,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for geo queries and text search
locationSchema.index({ lat: 1, lng: 1 });
locationSchema.index({ name: 'text', description: 'text' });

locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Location', locationSchema);

