"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.addPayment = exports.getAllPayments = void 0;
const server_1 = require("../server");
const payment_validator_1 = require("../validators/payment.validator");
const decimal_js_1 = __importDefault(require("decimal.js"));
const getAllPayments = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        else if (req.query.organization_id) {
            filter.organization_id = req.query.organization_id;
        }
        const payments = await server_1.prisma.payment.findMany({
            where: filter,
            include: {
                invoice: { select: { invoice_number: true, customer: { select: { customer_name: true } } } }
            },
            orderBy: { payment_date: 'desc' }
        });
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPayments = getAllPayments;
const addPayment = async (req, res, next) => {
    try {
        const data = payment_validator_1.createPaymentSchema.parse(req.body);
        const invoiceFilter = { id: data.invoice_id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            invoiceFilter.organization_id = req.user?.organization_id;
        }
        const invoice = await server_1.prisma.invoice.findFirst({
            where: invoiceFilter,
            include: { payments: true }
        });
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const newPaymentAmount = new decimal_js_1.default(data.amount);
        let totalPaid = new decimal_js_1.default(0);
        invoice.payments.forEach(p => {
            totalPaid = totalPaid.add(new decimal_js_1.default(p.amount.toString()));
        });
        const newTotalPaid = totalPaid.add(newPaymentAmount);
        const grandTotal = new decimal_js_1.default(invoice.grand_total.toString());
        let newStatus = invoice.status;
        if (newTotalPaid.gte(grandTotal)) {
            newStatus = 'PAID';
        }
        else if (newTotalPaid.gt(0)) {
            newStatus = 'PARTIALLY_PAID';
        }
        const result = await server_1.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    invoice_id: invoice.id,
                    organization_id: invoice.organization_id,
                    amount: data.amount,
                    payment_date: new Date(data.payment_date),
                    payment_method: data.payment_method,
                    transaction_reference: data.transaction_reference,
                    notes: data.notes
                }
            });
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: newStatus }
            });
            if (req.user) {
                await tx.auditLog.create({
                    data: {
                        organization_id: invoice.organization_id,
                        user_id: req.user.id,
                        action: 'PAYMENT_ADDED',
                        entity_type: 'PAYMENT',
                        entity_id: payment.id,
                        description: `Payment of ${data.amount} added to Invoice ${invoice.invoice_number}`
                    }
                });
            }
            return payment;
        });
        res.status(201).json({ success: true, message: 'Payment added successfully', data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.addPayment = addPayment;
const deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const paymentFilter = { id };
        if (req.user?.role !== 'SUPER_ADMIN') {
            paymentFilter.organization_id = req.user?.organization_id;
        }
        const payment = await server_1.prisma.payment.findFirst({
            where: paymentFilter,
            include: { invoice: { include: { payments: true } } }
        });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        const invoice = payment.invoice;
        let totalPaid = new decimal_js_1.default(0);
        invoice.payments.forEach(p => {
            if (p.id !== payment.id) { // Exclude the one being deleted
                totalPaid = totalPaid.add(new decimal_js_1.default(p.amount.toString()));
            }
        });
        const grandTotal = new decimal_js_1.default(invoice.grand_total.toString());
        let newStatus = invoice.status;
        if (totalPaid.eq(0)) {
            newStatus = 'SENT'; // Revert to SENT or VIEWED, but we'll use SENT as fallback
        }
        else if (totalPaid.lt(grandTotal)) {
            newStatus = 'PARTIALLY_PAID';
        }
        await server_1.prisma.$transaction(async (tx) => {
            await tx.payment.delete({ where: { id: payment.id } });
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: newStatus }
            });
        });
        res.status(200).json({ success: true, message: 'Payment deleted and invoice status updated' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePayment = deletePayment;
//# sourceMappingURL=payment.controller.js.map