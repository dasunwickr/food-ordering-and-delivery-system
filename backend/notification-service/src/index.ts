import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { websocketUtils } from './utils/websocketUtils';
import {broadcastEmailsWithTemplateController  } from './controllers/emailBroadcastController'; // Import the new controller
import { placeOrder } from './controllers/orderController';


// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Dhanuka:20020502@finacetracker.z0ps6.mongodb.net/?retryWrites=true&w=majority&appName=FinaceTracker')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('New WebSocket connection');

  // Handle incoming messages
  ws.on('message', (message: string) => {
    const data = JSON.parse(message);
    if (data.type === 'register' && data.userId) {
      websocketUtils.clients.set(data.userId, ws);
      logger.info(`User ${data.userId} registered`);
    }
  });

  // Handle connection close
  ws.on('close', () => {
    logger.info('WebSocket connection closed');
    for (const [userId, socket] of websocketUtils.clients.entries()) {
      if (socket === ws) {
        websocketUtils.clients.delete(userId);
        break;
      }
    }
  });
});



app.post('/orders',placeOrder)

// Route to broadcast emails
app.post('/broadcast-emails', broadcastEmailsWithTemplateController); // Use the new controller



// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});