"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/super-admin', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN']), dashboard_controller_1.getSuperAdminDashboard);
router.get('/org', (0, rbac_middleware_1.requireRole)(['ORGANIZATION_ADMIN', 'STAFF']), dashboard_controller_1.getOrganizationDashboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map