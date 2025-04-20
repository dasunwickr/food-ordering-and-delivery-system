import app from './src/app';
import { connectDB } from './src/config/db';

const PORT = process.env.PORT || 8082;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Session Service running on port ${PORT}`);
  });
};

startServer();
