import { Request, Response } from 'express';
import { SignUpSchema, SignInSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../validators/auth.schema';
import * as AuthService from '../services/auth.service';

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, userType, profile } = SignUpSchema.parse(req.body);
    const result = await AuthService.registerUser(email, password, userType, profile);
    res.status(201).json({ message: 'User registered', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password, device, ipAddress } = SignInSchema.parse(req.body);
    const result = await AuthService.loginUser(email, password, device, ipAddress);
    res.status(200).json({ 
      message: 'Logged in successfully', 
      userId: result.userId,
      sessionId: result.sessionId,
      token: result.sessionToken
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const result = await AuthService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset request processed', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
       res.status(400).json({ error: 'Email and OTP are required' });
    }
    const result = await AuthService.verifyOtp(email, otp);
    res.status(200).json({ message: 'OTP verified successfully', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, ipAddress } = ResetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(email, newPassword, ipAddress);
    res.status(200).json({ message: 'Password reset successful', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
