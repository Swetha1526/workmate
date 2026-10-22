import express from 'express';
import { register, login, adminLogin, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
