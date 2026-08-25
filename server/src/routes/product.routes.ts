import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getAllProducts);
router.post('/', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), createProduct);
router.get('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), getProductById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), updateProduct);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), deleteProduct);

export default router;
