import http from 'http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

// Initialize DB and launch server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 WorkMate Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down WorkMate server...');
  server.close(() => {
    console.log('WorkMate server closed.');
    process.exit(0);
  });
});
