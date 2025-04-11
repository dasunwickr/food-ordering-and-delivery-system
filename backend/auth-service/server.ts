import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Auth service running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Mongo connection error:', err));
