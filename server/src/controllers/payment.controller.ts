import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createPaymentSchema } from '../validators/payment.validator';
import Decimal from 'decimal.js';

export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const payments = await prisma.payment.findMany({
      where: filter,
      include: {
        invoice: { select: { invoice_number: true, customer: { select: { customer_name: true } } } }
      },
      orderBy: { payment_date: 'desc' }
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const addPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPaymentSchema.parse(req.body);

    const invoiceFilter: any = { id: data.invoice_id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      invoiceFilter.organization_id = req.user?.organization_id;
    }

    const invoice = await prisma.invoice.findFirst({
      where: invoiceFilter,
      include: { payments: true }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const newPaymentAmount = new Decimal(data.amount);
    let totalPaid = new Decimal(0);
    invoice.payments.forEach(p => {
      totalPaid = totalPaid.add(new Decimal(p.amount.toString()));
    });

    const newTotalPaid = totalPaid.add(newPaymentAmount);
    const grandTotal = new Decimal(invoice.grand_total.toString());

    let newStatus = invoice.status;
    if (newTotalPaid.gte(grandTotal)) {
      newStatus = 'PAID';
    } else if (newTotalPaid.gt(0)) {
      newStatus = 'PARTIALLY_PAID';
    }

    const result = await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const paymentFilter: any = { id };
    if (req.user?.role !== 'SUPER_ADMIN') {
      paymentFilter.organization_id = req.user?.organization_id;
    }

    const payment = await prisma.payment.findFirst({
      where: paymentFilter,
      include: { invoice: { include: { payments: true } } }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const invoice = payment.invoice;
    let totalPaid = new Decimal(0);
    invoice.payments.forEach(p => {
      if (p.id !== payment.id) { // Exclude the one being deleted
        totalPaid = totalPaid.add(new Decimal(p.amount.toString()));
      }
    });

    const grandTotal = new Decimal(invoice.grand_total.toString());
    let newStatus: any = invoice.status;
    
    if (totalPaid.eq(0)) {
      newStatus = 'SENT'; // Revert to SENT or VIEWED, but we'll use SENT as fallback
    } else if (totalPaid.lt(grandTotal)) {
      newStatus = 'PARTIALLY_PAID';
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: payment.id } });
      
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus }
      });
    });

    res.status(200).json({ success: true, message: 'Payment deleted and invoice status updated' });
  } catch (error) {
    next(error);
  }
};
