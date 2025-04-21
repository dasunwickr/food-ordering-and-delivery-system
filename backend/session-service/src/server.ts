import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import sessionRoutes from "./routes/session.route"

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev')); 
app.use(express.json()); 
app.use('/sessions', sessionRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});


const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1); 
  }
};

startServer();
