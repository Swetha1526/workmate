import express from 'express';
import {
  createOrUpdateProfile,
  getMyWorkerProfile,
  getWorkerById,
  getWorkers,
  verifyWorker,
} from '../controllers/workerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getWorkers);
router.get('/:id', getWorkerById);

// Worker authenticated routes
router.get('/me/profile', protect, authorize('worker'), getMyWorkerProfile);
router.post('/profile', protect, authorize('worker'), createOrUpdateProfile);

// Admin only routes
router.patch('/:id/verify', protect, authorize('admin'), verifyWorker);

export default router;
