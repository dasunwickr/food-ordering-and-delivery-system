import { Router } from 'express';
import { signUpHandler, loginHandler } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signUpHandler);
router.post('/login', loginHandler);

export default router;