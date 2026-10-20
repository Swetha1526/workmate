import express from 'express';
import cors from 'cors';

export const createApp = () => {
  const app = express();

  // CORS configuration
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
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
    res.json({
      status: 'ok',
      service: 'workmate-server',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    });
  });

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
