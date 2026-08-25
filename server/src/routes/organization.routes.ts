import { Router } from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  updateOrganizationStatus,
  deleteOrganization,
  getMeOrg
} from '../controllers/organization.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Organization specific route
router.get('/me', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getMeOrg);

// Super Admin only routes
router.get('/', requireRole(['SUPER_ADMIN']), getAllOrganizations);
router.post('/', requireRole(['SUPER_ADMIN']), createOrganization);
router.patch('/:id/status', requireRole(['SUPER_ADMIN']), updateOrganizationStatus);
router.delete('/:id', requireRole(['SUPER_ADMIN']), deleteOrganization);

// Super Admin or Organization Admin
router.get('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), getOrganizationById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), updateOrganization);

export default router;
