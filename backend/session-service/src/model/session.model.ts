import mongoose, { Schema, Document } from 'mongoose';

interface ISession {
  userId: string;
  sessionId: string;
  device: string;
  macAddress: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  device: { type: String, required: true },
  macAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const SessionModel = mongoose.model<ISession>('Session', sessionSchema);

export { SessionModel, ISession };
