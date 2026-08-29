import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { getAllPlans, getAdminPlans, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller';

const router = Router();

// Public route to get active plans
router.get('/', getAllPlans);

// Protected routes for SUPER_ADMIN
router.get('/admin', authenticate, requireRole(['SUPER_ADMIN']), getAdminPlans);
router.post('/', authenticate, requireRole(['SUPER_ADMIN']), createPlan);
router.put('/:id', authenticate, requireRole(['SUPER_ADMIN']), updatePlan);
router.delete('/:id', authenticate, requireRole(['SUPER_ADMIN']), deletePlan);

export default router;
