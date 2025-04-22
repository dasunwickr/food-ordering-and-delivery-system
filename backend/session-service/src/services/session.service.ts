
import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../model/session.model';

export const createSession = async (userId: string) => {
  const sessionId = uuidv4();

  const session = await SessionModel.create({
    userId,
    sessionId,
    isValid: true,
  });

  await redis.set(sessionId, userId, 'EX', 60 * 60 * 24 * 7); // 7 days TTL

  return session;
};

export const invalidateSession = async (sessionId: string) => {
  await SessionModel.updateOne({ sessionId }, { isValid: false });
  await redis.del(sessionId);
};

export const updateSession = async (sessionId: string) => {
  await SessionModel.updateOne({ sessionId }, { updatedAt: new Date() });
  await redis.expire(sessionId, 60 * 60 * 24 * 7); // Reset TTL
};
