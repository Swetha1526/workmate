import express from 'express';
import {
  createBooking,
  getMyBookings,
  getWorkerBookings,
  getBookingById,
  updateBookingStatus,
  recordDirectPayment,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All booking operations require authentication
router.use(protect);

router.post('/', authorize('customer'), createBooking);
router.get('/my-bookings', authorize('customer'), getMyBookings);
router.get('/worker-bookings', authorize('worker'), getWorkerBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/payment', recordDirectPayment);

export default router;
