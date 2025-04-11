import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidators';
import { signToken, verifyToken } from '../utils/jwtUtil';
import * as sessionService from "./sessionService"

export const signup = async (req: Request, res: Response) => {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);

    const { email, username, password } = parse.data;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ error: 'Email or username already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: 'User created' });
};

export const login = async (req: Request, res: Response) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);

    const { username, password } = parse.data;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = uuidv4();
    const token = signToken({ userId: user._id, sessionId });

    await sessionService.createSession(req, user._id.toString(), sessionId);

    res.json({ token });
};

export const forgotPassword = async (req: Request, res: Response) => {
    const parse = forgotPasswordSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);

    const { email } = parse.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = signToken({ userId: user._id }, '10m');

    res.json({ message: 'Password reset link sent', resetToken });
};

export const resetPassword = async (req: Request, res: Response) => {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error);

    try {
        const payload = verifyToken(parse.data.token) as any;
        const user = await User.findById(payload.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.password = await bcrypt.hash(parse.data.newPassword, 10);
        await user.save();

        await sessionService.invalidateAllSessions(req, user._id.toString());

        res.json({ message: 'Password reset successful' });
    } catch (e) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};