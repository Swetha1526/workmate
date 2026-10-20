import mongoose from 'mongoose';

export const BOOKING_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: [true, 'Worker profile ID is required'],
      index: true,
    },
    workerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker user ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Job category is required'],
    },
    jobDescription: {
      type: String,
      required: [true, 'Please provide a clear job description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    locality: {
      type: String,
      required: [true, 'Service locality or address is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required (e.g. 10:00 AM)'],
      trim: true,
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Estimated hours are required'],
      min: [1, 'Minimum booking duration is 1 hour'],
      max: [24, 'Estimated duration cannot exceed 24 hours per day'],
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    totalEstimatedCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUSES,
        message: '{VALUE} is an invalid booking status',
      },
      default: 'pending',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid_direct'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user bookings efficiently
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ workerUserId: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
