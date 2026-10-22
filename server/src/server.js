import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { seedDefaultAdmin } from './controllers/authController.js';
import { seedDemoWorkersIfEmpty } from './utils/seedData.js';
import { setupChatSocket } from './sockets/chatSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

// setup socket.io with cors for the frontend client
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

app.set('io', io);
setupChatSocket(io);

const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedDefaultAdmin();
    await seedDemoWorkersIfEmpty();
  }

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server shut down cleanly.');
    process.exit(0);
  });
});
