import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createToken = (userId: string, sessionId: string) => {
  return jwt.sign({ userId, sessionId }, SECRET, {
    expiresIn: '1d',
  });
};
