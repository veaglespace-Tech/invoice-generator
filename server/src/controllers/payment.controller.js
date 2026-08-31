'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAllPayments = exports.deletePayment = exports.addPayment = void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
var _payment = require('../validators/payment.validator');
var _decimal = _interopRequireDefault(require('decimal.js'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const getAllPayments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }
    const payments = await _server.prisma.payment.findMany({
      where: filter,
      include: {
        invoice: {
          select: {
            invoice_number: true,
            customer: {
              select: {
                customer_name: true
              }
            }
          }
        }
      },
      orderBy: {
        payment_date: 'desc'
      }
    });
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllPayments = getAllPayments;
const addPayment = async (req, res, next) => {
  try {
    const data = _payment.createPaymentSchema.parse(req.body);
    const invoiceFilter = {
      id: data.invoice_id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      invoiceFilter.organization_id = req.user?.organization_id;
    }
    const invoice = await _server.prisma.invoice.findFirst({
      where: invoiceFilter,
      include: {
        payments: true
      }
    });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    const newPaymentAmount = new _decimal.default(data.amount);
    let totalPaid = new _decimal.default(0);
    invoice.payments.forEach((p) => {
      totalPaid = totalPaid.add(new _decimal.default(p.amount.toString()));
    });
    const newTotalPaid = totalPaid.add(newPaymentAmount);
    const grandTotal = new _decimal.default(invoice.grand_total.toString());
    let newStatus = invoice.status;
    if (newTotalPaid.gte(grandTotal)) {
      newStatus = 'PAID';
    } else if (newTotalPaid.gt(0)) {
      newStatus = 'PARTIALLY_PAID';
    }
    const result = await _server.prisma.$transaction(async (tx) => {
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
        where: {
          id: invoice.id
        },
        data: {
          status: newStatus
        }
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
    res.status(201).json({
      success: true,
      message: 'Payment added successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
exports.addPayment = addPayment;
const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentFilter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      paymentFilter.organization_id = req.user?.organization_id;
    }
    const payment = await _server.prisma.payment.findFirst({
      where: paymentFilter,
      include: {
        invoice: {
          include: {
            payments: true
          }
        }
      }
    });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    const invoice = payment.invoice;
    let totalPaid = new _decimal.default(0);
    invoice.payments.forEach((p) => {
      if (p.id !== payment.id) {
        // Exclude the one being deleted
        totalPaid = totalPaid.add(new _decimal.default(p.amount.toString()));
      }
    });
    const grandTotal = new _decimal.default(invoice.grand_total.toString());
    let newStatus = invoice.status;
    if (totalPaid.eq(0)) {
      newStatus = 'SENT'; // Revert to SENT or VIEWED, but we'll use SENT as fallback
    } else if (totalPaid.lt(grandTotal)) {
      newStatus = 'PARTIALLY_PAID';
    }
    await _server.prisma.$transaction(async (tx) => {
      await tx.payment.delete({
        where: {
          id: payment.id
        }
      });
      await tx.invoice.update({
        where: {
          id: invoice.id
        },
        data: {
          status: newStatus
        }
      });
    });
    res.status(200).json({
      success: true,
      message: 'Payment deleted and invoice status updated'
    });
  } catch (error) {
    next(error);
  }
};
exports.deletePayment = deletePayment;
