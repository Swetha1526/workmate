import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Booking } from '../models/Booking.js';

/**
 * @desc    Get or initialize conversation for a specific booking
 * @route   GET /api/chat/booking/:bookingId
 * @access  Private (Participants or Admin)
 */
export const getBookingConversation = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isWorker = booking.workerUserId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access chat for this booking.',
      });
    }

    let conversation = await Conversation.findOne({ bookingId })
      .populate('participants', 'name email phone role avatar')
      .populate('bookingId', 'category status locality scheduledDate totalEstimatedCost');

    if (!conversation) {
      conversation = await Conversation.create({
        bookingId,
        participants: [booking.customerId, booking.workerUserId],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email phone role avatar')
        .populate('bookingId', 'category status locality scheduledDate totalEstimatedCost');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get chat message history for a conversation
 * @route   GET /api/chat/:conversationId/messages
 * @access  Private (Participants only)
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark unread messages as read by current user
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages.',
      error: error.message,
    });
  }
};

/**
 * @desc    Send a message via REST API (fallback if socket disconnected)
 * @route   POST /api/chat/:conversationId/messages
 * @access  Private (Participants only)
 */
export const sendMessageRest = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to post messages.' });
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    // Update conversation last message
    conversation.lastMessage = {
      text: text.trim().substring(0, 80),
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name role avatar'
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
};
