import mongoose from 'mongoose';
import { WorkerProfile } from './WorkerProfile.js';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Only one review allowed per booking
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Post-save hook to recalculate Worker average rating automatically
reviewSchema.post('save', async function () {
  try {
    const stats = await this.constructor.aggregate([
      { $match: { workerId: this.workerId } },
      {
        $group: {
          _id: '$workerId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await WorkerProfile.findByIdAndUpdate(this.workerId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    }
  } catch (error) {
    console.error('Error recalculating worker rating:', error);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
