import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const setupChatSocket = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const secret = process.env.JWT_SECRET || 'workmate_fallback_secret_key';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User invalid or inactive'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: User ${socket.user.name} (${socket.user.role}) - ID: ${socket.id}`);

    // Join personal notification channel
    socket.join(`user:${socket.user._id}`);

    /**
     * Join booking conversation room with security check
     */
    socket.on('conversation:join', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation room not found.' });
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.user._id.toString()
        );
        const isAdmin = socket.user.role === 'admin';

        if (!isParticipant && !isAdmin) {
          return socket.emit('error', { message: 'Unauthorized room access.' });
        }

        const roomName = `conv:${conversationId}`;
        socket.join(roomName);

        socket.emit('conversation:joined', {
          conversationId,
          room: roomName,
          joinedAt: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Send real-time message (Persisted to MongoDB)
     */
    socket.on('message:send', async ({ conversationId, text }) => {
      try {
        if (!conversationId || !text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.user._id.toString()
        );
        if (!isParticipant && socket.user.role !== 'admin') return;

        // Persist message
        const message = await Message.create({
          conversationId,
          sender: socket.user._id,
          text: text.trim(),
          readBy: [socket.user._id],
        });

        // Update conversation last message
        conversation.lastMessage = {
          text: text.trim().substring(0, 80),
          sender: socket.user._id,
          createdAt: new Date(),
        };
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name role avatar'
        );

        // Broadcast to room
        io.to(`conv:${conversationId}`).emit('message:new', {
          conversationId,
          message: populatedMessage,
        });

        // Send push notification to other participants
        conversation.participants.forEach((participantId) => {
          if (participantId.toString() !== socket.user._id.toString()) {
            io.to(`user:${participantId}`).emit('notification:new', {
              type: 'message',
              title: `New message from ${socket.user.name}`,
              body: text.trim().substring(0, 60),
              conversationId,
            });
          }
        });
      } catch (error) {
        console.error('Socket message send error:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    /**
     * Typing indicators
     */
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: socket.user._id,
        userName: socket.user.name,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: socket.user._id,
      });
    });

    /**
     * Read receipts
     */
    socket.on('message:read', async ({ conversationId, messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: socket.user._id },
        });

        io.to(`conv:${conversationId}`).emit('message:read_update', {
          conversationId,
          messageId,
          userId: socket.user._id,
        });
      } catch (err) {
        console.error('Error updating read receipt:', err);
      }
    });

    /**
     * Real-time booking status broadcast
     */
    socket.on('booking:status_updated', ({ bookingId, status, recipientUserId }) => {
      if (recipientUserId) {
        io.to(`user:${recipientUserId}`).emit('booking:status_updated', {
          bookingId,
          status,
          updatedBy: socket.user.name,
        });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};
