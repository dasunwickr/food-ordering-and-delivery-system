import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionModel } from '../model/session.model';
import { CreateSessionSchema, UpdateSessionSchema } from '../validators/session.schema';

import redis from '../config/redis';
import { createToken } from '../utils/jwt.utils';

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
