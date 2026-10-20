import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { seedDefaultAdmin } from './controllers/authController.js';
import { seedDemoWorkersIfEmpty } from './utils/seedData.js';
import { setupChatSocket } from './sockets/chatSocket.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

// Socket.IO configuration with CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

// Attach io instance to express app for controller access
app.set('io', io);

// Initialize chat socket handlers
setupChatSocket(io);

// Initialize DB and launch server
const startServer = async () => {
  // Connect to Database
  const isConnected = await connectDB();
  if (isConnected) {
    await seedDefaultAdmin();
    await seedDemoWorkersIfEmpty();
  }

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
