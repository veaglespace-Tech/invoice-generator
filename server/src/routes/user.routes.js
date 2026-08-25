"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Super Admin or Organization Admin can manage users
router.get('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), user_controller_1.getAllUsers);
router.post('/', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), user_controller_1.createUser);
router.get('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), user_controller_1.getUserById);
router.put('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), user_controller_1.updateUser);
router.delete('/:id', (0, rbac_middleware_1.requireRole)(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']), user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map