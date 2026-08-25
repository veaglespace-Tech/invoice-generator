"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoice = exports.downloadInvoicePDF = exports.deleteInvoice = exports.updateInvoiceStatus = exports.createInvoice = exports.getInvoiceById = exports.getAllInvoices = void 0;
const server_1 = require("../server");
const invoice_validator_1 = require("../validators/invoice.validator");
const invoice_service_1 = require("../services/invoice.service");
const getAllInvoices = async (req, res, next) => {
    try {
        const filter = { is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        else if (req.query.organization_id) {
            filter.organization_id = req.query.organization_id;
        }
        const invoices = await server_1.prisma.invoice.findMany({
            where: filter,
            include: {
                customer: { select: { customer_name: true, company_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInvoices = getAllInvoices;
const getInvoiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const invoice = await server_1.prisma.invoice.findFirst({
            where: filter,
            include: {
                customer: true,
                items: true,
                organization: {
                    include: { settings: true }
                }
            }
        });
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceById = getInvoiceById;
const createInvoice = async (req, res, next) => {
    try {
        const data = invoice_validator_1.createInvoiceSchema.parse(req.body);
        let targetOrgId = req.user?.organization_id;
        if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
            targetOrgId = req.body.organization_id;
        }
        if (!targetOrgId) {
            return res.status(400).json({ success: false, message: 'Organization ID is required' });
        }
        // Backend-side calculation engine
        const { calculatedItems, totals } = await (0, invoice_service_1.calculateInvoice)(targetOrgId, data.customer_id, data.items);
        // Generate Invoice Number
        const invoiceNumber = await (0, invoice_service_1.generateInvoiceNumber)(targetOrgId);
        const result = await server_1.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    organization_id: targetOrgId,
                    invoice_number: invoiceNumber,
                    customer_id: data.customer_id,
                    invoice_date: new Date(data.invoice_date),
                    due_date: new Date(data.due_date),
                    ...totals,
                    notes: data.notes,
                    terms: data.terms,
                    payment_details: data.payment_details,
                    items: {
                        create: calculatedItems
                    }
                },
                include: { items: true }
            });
            // Audit Log
            if (req.user) {
                await tx.auditLog.create({
                    data: {
                        organization_id: targetOrgId,
                        user_id: req.user.id,
                        action: 'INVOICE_CREATED',
                        entity_type: 'INVOICE',
                        entity_id: invoice.id,
                        description: `Invoice ${invoiceNumber} created`
                    }
                });
            }
            return invoice;
        });
        res.status(201).json({ success: true, message: 'Invoice created successfully', data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
const updateInvoiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = invoice_validator_1.updateInvoiceStatusSchema.parse(req.body);
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingInvoice = await server_1.prisma.invoice.findFirst({ where: filter });
        if (!existingInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const updatedInvoice = await server_1.prisma.invoice.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, message: `Invoice marked as ${status}`, data: updatedInvoice });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInvoiceStatus = updateInvoiceStatus;
const deleteInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingInvoice = await server_1.prisma.invoice.findFirst({ where: filter });
        if (!existingInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        await server_1.prisma.invoice.update({
            where: { id },
            data: { is_deleted: true, deleted_at: new Date(), status: 'CANCELLED' }
        });
        res.status(200).json({ success: true, message: 'Invoice deleted (cancelled)' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoice = deleteInvoice;
const pdf_service_1 = require("../services/pdf.service");
const downloadInvoicePDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const invoice = await server_1.prisma.invoice.findFirst({
            where: filter,
            include: {
                customer: true,
                items: true,
                organization: {
                    include: { settings: true }
                }
            }
        });
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const pdfBuffer = await (0, pdf_service_1.generateInvoicePDF)(invoice);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
        res.status(200).send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadInvoicePDF = downloadInvoicePDF;
const email_service_1 = require("../services/email.service");
const sendInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const invoice = await server_1.prisma.invoice.findFirst({
            where: filter,
            include: {
                customer: true,
                items: true,
                organization: {
                    include: { settings: true }
                }
            }
        });
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        if (!invoice.customer.email) {
            return res.status(400).json({ success: false, message: 'Customer does not have an email address' });
        }
        await (0, email_service_1.sendInvoiceEmail)(invoice);
        res.status(200).json({ success: true, message: 'Invoice sent successfully via email' });
    }
    catch (error) {
        next(error);
    }
};
exports.sendInvoice = sendInvoice;
//# sourceMappingURL=invoice.controller.js.map