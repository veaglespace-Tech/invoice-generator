import { Router } from 'express';
import { getAllPayments, addPayment, deletePayment } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getAllPayments);
router.post('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), addPayment);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), deletePayment);

export default router;
