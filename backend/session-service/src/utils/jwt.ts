import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const createToken = (userId: string, sessionId: string) => {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};
