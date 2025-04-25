import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// Auth routes
router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);

export default router;
