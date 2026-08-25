"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_controller_1 = require("../controllers/organization.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Organization specific route
router.get('/me', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'STAFF']), organization_controller_1.getMeOrg);
// Super Admin only routes
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN']), organization_controller_1.getAllOrganizations);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN']), organization_controller_1.createOrganization);
router.patch('/:id/status', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN']), organization_controller_1.updateOrganizationStatus);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN']), organization_controller_1.deleteOrganization);
// Super Admin or Organization Admin
router.get('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), organization_controller_1.getOrganizationById);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), organization_controller_1.updateOrganization);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map