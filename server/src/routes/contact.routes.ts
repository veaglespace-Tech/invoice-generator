import { Router } from 'express';
import { createLead, getLeads, markLeadAsRead } from '../controllers/contact.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public route to submit a contact form
router.post('/', createLead);

// Protected super admin routes
router.get('/', authenticate, requireRole([Role.SUPER_ADMIN]), getLeads);
router.patch('/:id/read', authenticate, requireRole([Role.SUPER_ADMIN]), markLeadAsRead);

export default router;
