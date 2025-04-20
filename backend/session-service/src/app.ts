import express from 'express';
import sessionRoutes from './routes/session.route';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('/api/sessions', sessionRoutes);

export default app;
