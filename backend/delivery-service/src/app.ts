import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./utils/db.util";

const app = express();

// Middlewarea
app.use(express.json());
app.use(cors());

// Database Connection
connectToDatabase();

export default app;
