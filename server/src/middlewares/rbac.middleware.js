"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = void 0;
const server_1 = require("../server");
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (permission) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // SUPER_ADMIN and ORGANIZATION_ADMIN have all permissions inherently in this system
        if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ORGANIZATION_ADMIN') {
            return next();
        }
        // Check specific permission for STAFF
        try {
            const userPermission = await server_1.prisma.userPermission.findUnique({
                where: {
                    user_id_permission: {
                        user_id: req.user.id,
                        permission: permission
                    }
                }
            });
            if (!userPermission) {
                return res.status(403).json({ success: false, message: 'Forbidden: Missing required permission' });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=rbac.middleware.js.map