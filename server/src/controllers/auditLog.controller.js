"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = void 0;
const server_1 = require("../server");
const getAuditLogs = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        else if (req.query.organization_id) {
            filter.organization_id = req.query.organization_id;
        }
        const logs = await server_1.prisma.auditLog.findMany({
            where: filter,
            include: {
                user: { select: { name: true, email: true } },
                organization: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 100 // pagination could be implemented here
        });
        res.status(200).json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=auditLog.controller.js.map