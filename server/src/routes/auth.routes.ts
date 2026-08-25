import { Router } from 'express';
import { registerOrganization, login, getMe, refresh, logout } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerOrganization);
router.post('/login', login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
