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
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Database Connection
connectToDatabase();

// Initialize Socket.IO with the server
initializeSocket(server);

// API Routes - Change from /api/deliveries to /api to match API gateway rewrite
app.use("/api", deliveryRoutes);

export { app, server };
