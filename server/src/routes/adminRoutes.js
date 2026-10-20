import express from 'express';
import {
  getPlatformMetrics,
  getAdminUsers,
  toggleUserStatus,
  getAdminWorkers,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes strictly require admin role
router.use(protect, authorize('admin'));

router.get('/metrics', getPlatformMetrics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/workers', getAdminWorkers);

export default router;
