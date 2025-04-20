import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SessionModel } from '../model/session.model';
import { CreateSessionSchema, UpdateSessionSchema } from '../validators/session.schema';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

// Create Session
export const createSession = async (req: Request, res: Response) => {
  try {
    // Validate the request body using Zod
    const parsed = CreateSessionSchema.parse(req.body);
    const { userId, device, macAddress } = parsed;

    // Generate a sessionId and JWT token
    const sessionId = jwt.sign({ userId, device, macAddress }, SECRET_KEY, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    // Create and save the session in the DB
    const newSession = new SessionModel({
      userId,
      sessionId,
      device,
      macAddress,
      expiresAt,
    });

    await newSession.save();

    // Send the response
    res.status(201).json({
      sessionId,
      token: sessionId,
    });
  } catch (error: any) {
    console.error("Create Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Update Session (Refresh Expiry)
export const updateSession = async (req: Request, res: Response) => {
  try {
    const parsed = UpdateSessionSchema.parse(req.body);
    const { sessionId } = parsed;

    // Find session and update expiry
    const session = await SessionModel.findOne({ sessionId });

    if (!session) {
      throw new Error('Session not found');
    }

    session.expiresAt = new Date(Date.now() + 3600000); // Extend expiry for 1 hour
    await session.save();

    res.status(200).json({ message: 'Session updated' });
  } catch (error: any) {
    console.error("Update Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Invalidate Session (Delete)
export const invalidateSession = async (req: Request, res: Response) => {
  try {
    const parsed = UpdateSessionSchema.parse(req.body);
    const { sessionId } = parsed;

    // Find and delete the session
    const session = await SessionModel.findOneAndDelete({ sessionId });

    if (!session) {
      throw new Error('Session not found');
    }

    res.status(200).json({ message: 'Session invalidated' });
  } catch (error: any) {
    console.error("Invalidate Session Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};
