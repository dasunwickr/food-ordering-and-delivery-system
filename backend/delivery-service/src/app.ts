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
app.use(cors());

// Database Connection
connectToDatabase();

// Initialize Socket.IO with the server
initializeSocket(server);

// API Routes
app.use("/api", deliveryRoutes);

export { app, server };
