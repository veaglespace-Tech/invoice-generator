"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationDashboard = exports.getSuperAdminDashboard = void 0;
const server_1 = require("../server");
const getSuperAdminDashboard = async (req, res, next) => {
    try {
        const [totalOrganizations, activeOrganizations, suspendedOrganizations, totalUsers, totalCustomers, totalInvoices, invoices] = await Promise.all([
            server_1.prisma.organization.count({ where: { is_deleted: false } }),
            server_1.prisma.organization.count({ where: { status: 'ACTIVE', is_deleted: false } }),
            server_1.prisma.organization.count({ where: { status: 'SUSPENDED', is_deleted: false } }),
            server_1.prisma.user.count({ where: { is_deleted: false } }),
            server_1.prisma.customer.count({ where: { is_deleted: false } }),
            server_1.prisma.invoice.count({ where: { is_deleted: false } }),
            server_1.prisma.invoice.findMany({ where: { is_deleted: false }, select: { status: true, grand_total: true } })
        ]);
        let totalInvoiceValue = 0;
        let totalPaidAmount = 0;
        let totalPendingAmount = 0;
        let totalOverdueAmount = 0;
        invoices.forEach(inv => {
            const amount = Number(inv.grand_total);
            totalInvoiceValue += amount;
            if (inv.status === 'PAID') {
                totalPaidAmount += amount;
            }
            else if (inv.status === 'OVERDUE') {
                totalOverdueAmount += amount;
            }
            else if (inv.status !== 'CANCELLED') {
                totalPendingAmount += amount;
            }
        });
        res.status(200).json({
            success: true,
            data: {
                cards: {
                    totalOrganizations,
                    activeOrganizations,
                    suspendedOrganizations,
                    totalUsers,
                    totalCustomers,
                    totalInvoices,
                    totalInvoiceValue,
                    totalPaidAmount,
                    totalPendingAmount,
                    totalOverdueAmount
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSuperAdminDashboard = getSuperAdminDashboard;
const getOrganizationDashboard = async (req, res, next) => {
    try {
        const organization_id = req.user?.organization_id;
        if (!organization_id) {
            return res.status(400).json({ success: false, message: 'Organization ID missing' });
        }
        const [totalCustomers, totalInvoices, invoices] = await Promise.all([
            server_1.prisma.customer.count({ where: { organization_id, is_deleted: false } }),
            server_1.prisma.invoice.count({ where: { organization_id, is_deleted: false } }),
            server_1.prisma.invoice.findMany({ where: { organization_id, is_deleted: false }, select: { status: true, grand_total: true, created_at: true } })
        ]);
        let totalInvoiceValue = 0;
        let totalPaidAmount = 0;
        let totalPendingAmount = 0;
        invoices.forEach(inv => {
            const amount = Number(inv.grand_total);
            totalInvoiceValue += amount;
            if (inv.status === 'PAID') {
                totalPaidAmount += amount;
            }
            else if (inv.status !== 'CANCELLED' && inv.status !== 'DRAFT') {
                totalPendingAmount += amount;
            }
        });
        const recentInvoicesRaw = await server_1.prisma.invoice.findMany({
            where: { organization_id, is_deleted: false },
            orderBy: { created_at: 'desc' },
            take: 4,
            include: { customer: true }
        });
        const recentInvoices = recentInvoicesRaw.map(inv => ({
            id: inv.invoice_number,
            client: inv.customer?.customer_name || 'Unknown',
            amount: `₹${Number(inv.grand_total).toLocaleString('en-IN')}`,
            status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase().replace('_', ' '),
            date: new Date(inv.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        }));
        res.status(200).json({
            success: true,
            data: {
                cards: {
                    totalCustomers,
                    totalInvoices,
                    totalInvoiceValue,
                    totalPaidAmount,
                    totalPendingAmount
                },
                recentInvoices
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationDashboard = getOrganizationDashboard;
//# sourceMappingURL=dashboard.controller.js.map