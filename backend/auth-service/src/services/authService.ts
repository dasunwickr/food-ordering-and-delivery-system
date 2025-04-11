import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidators';
import { signToken, verifyToken } from '../utils/jwtUtil';
import * as sessionService from './sessionService';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parse = signupSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json(parse.error);
            return;
        }

        const { email, username, password } = parse.data;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(409).json({ error: 'Email or username already in use' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User signed up successfully' });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parse = loginSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json(parse.error);
            return;
        }

        const { username, password } = parse.data;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const sessionId = uuidv4();
        const token = signToken({ userId: user._id, sessionId });

        await sessionService.createSession(req, user._id.toString(), sessionId);

        res.json({ token });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parse = forgotPasswordSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json(parse.error);
            return;
        }

        const { email } = parse.data;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const resetToken = signToken({ userId: user._id }, '10m');

        res.json({ message: 'Password reset link sent', resetToken });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parse = resetPasswordSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json(parse.error);
            return;
        }

        const payload = verifyToken(parse.data.token) as any;
        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        user.password = await bcrypt.hash(parse.data.newPassword, 10);
        await user.save();

        await sessionService.invalidateAllSessions(req, user._id.toString());

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};