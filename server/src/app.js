import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = () => {
  const app = express();

  // CORS configuration (supports custom client URL, Vercel deployments, and local dev)
  const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const cleanClientUrl = rawClientUrl.replace(/\/+$/, '');

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const clean = origin.replace(/\/+$/, '');
        if (
          clean === cleanClientUrl ||
          clean === 'http://localhost:5173' ||
          clean.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root welcome & API health check endpoints
  app.get('/', (req, res) => {
    res.json({
      message: 'WorkMate On-Demand Marketplace API',
      version: '1.0.0',
      status: 'active',
      healthCheck: '/api/health',
    });
  });

  app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
      status: 'ok',
      service: 'workmate-server',
      database: isDbConnected ? 'connected' : 'disconnected',
      databaseName: isDbConnected ? mongoose.connection.name : null,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    });
  });

  // API Routes (supports both /api/* and fallback routes without /api prefix)
  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);
  app.use('/api/workers', workerRoutes);
  app.use('/workers', workerRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/bookings', bookingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/chat', chatRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/admin', adminRoutes);

  // Global 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `The requested endpoint ${req.originalUrl} does not exist.`,
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Application Error:', err);
    res.status(err.status || 500).json({
      error: 'Server Error',
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
};
