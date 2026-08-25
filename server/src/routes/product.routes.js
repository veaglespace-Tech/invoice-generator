"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), product_controller_1.getAllProducts);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), product_controller_1.createProduct);
router.get('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), product_controller_1.getProductById);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), product_controller_1.updateProduct);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), product_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map