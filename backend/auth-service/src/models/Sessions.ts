import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deviceInfo: String,
    ipAddress: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isValid: { type: Boolean, default: true }
});

export default mongoose.model('Session', sessionSchema);