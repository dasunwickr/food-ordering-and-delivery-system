import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase } from "./utils/db.util";
import deliveryRoutes from "./routes/delivery.route";

const app = express();

// Middlewarea
app.use(express.json());
app.use(cors());

// Database Connection
connectToDatabase();

app.use("/api", deliveryRoutes);

export default app;
