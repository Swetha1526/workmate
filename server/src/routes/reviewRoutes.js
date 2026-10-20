import express from 'express';
import {
  createReview,
  getWorkerReviews,
  checkReviewEligibility,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/worker/:workerId', getWorkerReviews);
router.get('/check/:bookingId', protect, checkReviewEligibility);
router.post('/', protect, authorize('customer'), createReview);

export default router;
