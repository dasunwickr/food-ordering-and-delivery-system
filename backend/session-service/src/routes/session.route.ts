import { Router } from 'express';
import { createSession, updateSession, invalidateSession } from '../controllers/session.controller';

const router = Router();

// POST /api/sessions/create - Create session
router.post('/create', createSession);

// POST /api/sessions/update - Update session
router.post('/update', updateSession);

// POST /api/sessions/invalidate - Invalidate session
router.post('/invalidate', invalidateSession);

export default router;
