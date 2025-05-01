import { Router, Request, Response, NextFunction } from 'express';
import * as AuthController from '../controllers/auth.controller';

const router = Router();


type RequestHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any> | void;


router.post('/signup', AuthController.signUp as RequestHandler);
router.post('/signin', AuthController.signIn as RequestHandler);
router.post('/forgot-password', AuthController.forgotPassword as RequestHandler);
router.post('/verify-otp', AuthController.verifyOtp as RequestHandler);
router.post('/reset-password', AuthController.resetPassword as RequestHandler);
router.post('/change-password', AuthController.changePassword as RequestHandler);


router.get('/email/:email/exists', AuthController.checkEmailExists as RequestHandler);


router.post('/send-email', AuthController.sendCustomEmail as RequestHandler);

router.delete('/users/:userId', AuthController.deleteUser as RequestHandler);

export default router;
