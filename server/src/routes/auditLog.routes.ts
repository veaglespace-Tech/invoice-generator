import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLog.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), getAuditLogs);

export default router;
