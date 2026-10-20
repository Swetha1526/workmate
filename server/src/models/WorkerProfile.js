import mongoose from 'mongoose';

export const WORKER_CATEGORIES = [
  'plumbers',
  'electricians',
  'carpenters',
  'ac_mechanics',
  'welders',
  'fitters',
  'drivers',
  'helpers',
  'masons',
  'mason_helpers',
];

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please select your primary trade category'],
      enum: {
        values: WORKER_CATEGORIES,
        message: '{VALUE} is not a supported trade category',
      },
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Please provide at least one skill',
      },
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please specify your years of experience'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    locality: {
      type: String,
      required: [true, 'Please provide your operating locality or city'],
      trim: true,
      index: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please specify your hourly rate'],
      min: [50, 'Minimum hourly rate is ₹50'],
      max: [5000, 'Maximum hourly rate is ₹5000'],
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast discovery filtering
workerProfileSchema.index({ category: 1, locality: 1, isAvailable: 1, hourlyRate: 1 });

export const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
