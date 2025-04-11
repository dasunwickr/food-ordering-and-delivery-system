import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6),
});
