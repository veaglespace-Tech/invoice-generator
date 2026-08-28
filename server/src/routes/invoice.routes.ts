import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoicePDF,
  sendInvoice,
  getNextInvoiceNumber
} from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getAllInvoices);
router.post('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), createInvoice);
router.get('/next-number', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getNextInvoiceNumber);
router.get('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getInvoiceById);
router.get('/:id/pdf', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), downloadInvoicePDF);
router.post('/:id/send', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), sendInvoice);
router.patch('/:id/status', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), updateInvoiceStatus);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), deleteInvoice);

export default router;
