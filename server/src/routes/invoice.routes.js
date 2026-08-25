"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.getAllInvoices);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.createInvoice);
router.get('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.getInvoiceById);
router.get('/:id/pdf', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.downloadInvoicePDF);
router.post('/:id/send', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.sendInvoice);
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), invoice_controller_1.updateInvoiceStatus);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), invoice_controller_1.deleteInvoice);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map