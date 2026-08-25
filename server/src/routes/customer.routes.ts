import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// STAFF can only access if they have permissions. In a real system you might have `requirePermission('VIEW_CUSTOMERS')` etc.
// For now, let's allow SUPER_ADMIN, ORGANIZATION_ADMIN and STAFF (but staff permissions would be checked in business logic or fine-grained middleware)
router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getAllCustomers);
router.post('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), createCustomer);
router.get('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getCustomerById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), updateCustomer);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), deleteCustomer);

export default router;
