import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Super Admin or Organization Admin can manage users
router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), getAllUsers);
router.post('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), createUser);
router.get('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), getUserById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), updateUser);
router.put('/:id/password', changePassword);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), deleteUser);

export default router;
