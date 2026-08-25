"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), payment_controller_1.getAllPayments);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), payment_controller_1.addPayment);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), payment_controller_1.deletePayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map