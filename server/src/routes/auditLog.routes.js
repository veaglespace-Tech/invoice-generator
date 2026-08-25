"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLog_controller_1 = require("../controllers/auditLog.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), auditLog_controller_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=auditLog.routes.js.map