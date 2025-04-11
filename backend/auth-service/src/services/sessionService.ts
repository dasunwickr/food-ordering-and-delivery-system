import { Request } from 'express';
import Session from '../models/Session';

export const createSession = async (req: Request, userId: string, sessionId: string) => {
    const redis = req.app.get('redis');

    await redis.set(`session:${sessionId}`, userId, 'EX', 86400);

    await Session.create({
        sessionId,
        userId,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 86400 * 1000),
    });
};

export const invalidateAllSessions = async (req: Request, userId: string) => {
    const redis = req.app.get('redis');
    const sessions = await Session.find({ userId, isValid: true });
    for (const session of sessions) {
        await redis.del(`session:${session.sessionId}`);
        session.isValid = false;
        await session.save();
    }
};