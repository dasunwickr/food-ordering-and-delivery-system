import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
// app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI!);

export default app;