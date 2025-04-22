import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import sessionRoutes from "./routes/session.route";
import { cleanupExpiredSessions } from './services/cleanup.service';
import logger from './utils/logger';

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/sessions', sessionRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});


const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const setupSessionCleanup = () => {
 
  cleanupExpiredSessions()
    .then(() => logger.info('Initial session cleanup completed'))
    .catch(err => logger.error('Initial session cleanup failed', err));
  
 
  setInterval(() => {
    cleanupExpiredSessions()
      .catch(err => logger.error('Scheduled session cleanup failed', err));
  }, CLEANUP_INTERVAL_MS);
  
  logger.info(`Automatic session cleanup scheduled (every ${CLEANUP_INTERVAL_MS / (60 * 1000)} minutes)`);
};

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Session service running on port ${PORT}`);
      setupSessionCleanup(); 
    });
  } catch (err) {
    logger.error('Failed to connect to DB', err);
    process.exit(1);
  }
};

startServer();
