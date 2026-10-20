import express from 'express';
import {
  getBookingConversation,
  getMessages,
  sendMessageRest,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/booking/:bookingId', getBookingConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessageRest);

export default router;
