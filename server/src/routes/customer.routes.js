"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// STAFF can only access if they have permissions. In a real system you might have `requirePermission('VIEW_CUSTOMERS')` etc.
// For now, let's allow SUPER_ADMIN, ORGANIZATION_ADMIN and STAFF (but staff permissions would be checked in business logic or fine-grained middleware)
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), customer_controller_1.getAllCustomers);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), customer_controller_1.createCustomer);
router.get('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), customer_controller_1.getCustomerById);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), customer_controller_1.updateCustomer);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), customer_controller_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map