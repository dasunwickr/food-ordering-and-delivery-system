import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../model/session.model';
import { CreateSessionSchema, UpdateSessionSchema, InvalidateUserSessionsSchema } from '../validators/session.schema';

import redis from '../config/redis';
import { createToken } from '../utils/jwt.utils';
import logger from '../utils/logger';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export const createSession = async (req: Request, res: Response) => {
  try {
    const { userId, device, macAddress } = CreateSessionSchema.parse(req.body);
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + ONE_DAY_MS);

    const session = await SessionModel.create({
      userId,
      sessionId,
      device,
      macAddress,
      expiresAt,
    });

    await redis.set(sessionId, userId, 'EX', ONE_DAY_MS / 1000); // 1 day in seconds
    const token = createToken(userId, sessionId);

    res.status(201).json({ sessionId, token });
  } catch (error: any) {
    console.error("Create Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = UpdateSessionSchema.parse(req.body);
    const session = await SessionModel.findOne({ sessionId });

    if (!session) throw new Error('Session not found');

    session.expiresAt = new Date(Date.now() + ONE_DAY_MS);
    await session.save();

    await redis.expire(sessionId, ONE_DAY_MS / 1000);

    res.status(200).json({ message: 'Session updated' });
  } catch (error: any) {
    console.error("Update Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const invalidateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = UpdateSessionSchema.parse(req.body);

    const session = await SessionModel.findOneAndDelete({ sessionId });
    if (!session) throw new Error('Session not found');

    await redis.del(sessionId);

    res.status(200).json({ message: 'Session invalidated' });
  } catch (error: any) {
    console.error("Invalidate Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Invalidate all sessions for a specific user ID
 * Useful for scenarios like forced logout from all devices, account suspension, password changes
 */
export const invalidateUserSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = InvalidateUserSessionsSchema.parse(req.body);
    
    // Find all sessions for the user
    const userSessions = await SessionModel.find({ userId });
    
    if (userSessions.length === 0) {
       res.status(404).json({ error: 'No active sessions found for this user' });
    }
    
    // Get all session IDs to remove from Redis
    const sessionIds = userSessions.map(session => session.sessionId);
    
    // Remove from MongoDB
    const deleteResult = await SessionModel.deleteMany({ userId });
    
    // Remove from Redis using pipeline for efficiency
    if (sessionIds.length > 0) {
      const pipeline = redis.pipeline();
      sessionIds.forEach(id => {
        pipeline.del(id);
      });
      await pipeline.exec();
    }
    
    logger.info(`Invalidated ${deleteResult.deletedCount} sessions for user ${userId}`);
    
    res.status(200).json({ 
      message: 'All user sessions invalidated successfully',
      count: deleteResult.deletedCount
    });
  } catch (error: any) {
    logger.error("Invalidate User Sessions Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};
