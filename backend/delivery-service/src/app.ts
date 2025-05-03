import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
dotenv.config();

import { connectToDatabase } from "./utils/db.util";
import { initializeSocket } from "./utils/socket.util";
import deliveryRoutes from "./routes/delivery.route";

// Create Express application
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Database Connections
// This connects to both the delivery-service DB (for legacy reasons) 
// and ensures connection to the order-service DB is established
connectToDatabase();

// Initialize Socket.IO with the server
initializeSocket(server);

// API Routes - Change from /api/deliveries to /api to match API gateway rewrite
app.use("/api", deliveryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'delivery-service' });
});

export { app, server };
