import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(['CUSTOMER', 'DRIVER', 'RESTAURANT', 'ADMIN']),
  device: z.string(),
  ipAddress: z.string(),
  profile: z.record(z.any())  
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  device: z.string(),
  ipAddress: z.string()
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email()
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6),
  ipAddress: z.string()
});
