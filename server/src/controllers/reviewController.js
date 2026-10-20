import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';

/**
 * @desc    Submit a review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (Customer only)
 */
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, rating (1-5), and comments are required.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Must be the customer who placed the booking
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who booked this service can submit a review.',
      });
    }

    // Must be in completed status
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after a booking has been marked as completed.',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking.',
      });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      workerId: booking.workerId,
      rating: numRating,
      comment: comment.trim(),
    });

    const populatedReview = await Review.findById(review._id).populate(
      'customerId',
      'name avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: populatedReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting review.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all reviews for a worker
 * @route   GET /api/reviews/worker/:workerId
 * @access  Public
 */
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ workerId });
    const reviews = await Review.find({ workerId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews.',
      error: error.message,
    });
  }
};

/**
 * @desc    Check if a booking has already been reviewed
 * @route   GET /api/reviews/check/:bookingId
 * @access  Private
 */
export const checkReviewEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ bookingId });
    res.json({
      success: true,
      hasReviewed: Boolean(review),
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
