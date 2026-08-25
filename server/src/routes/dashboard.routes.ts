import { Router } from 'express';
import { getSuperAdminDashboard, getOrganizationDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/super-admin', requireRole(['SUPER_ADMIN']), getSuperAdminDashboard);
router.get('/org', requireRole(['ORGANIZATION_ADMIN', 'STAFF']), getOrganizationDashboard);

export default router;
