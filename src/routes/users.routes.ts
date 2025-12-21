import { Router } from 'express';
import { me } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, me);

export default router;
