import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase } from "./utils/db.util";

const app = express();

// Middlewarea
app.use(express.json());
app.use(cors());

// Database Connection
connectToDatabase();

app.use("/api/v1/deliveries");

export default app;
