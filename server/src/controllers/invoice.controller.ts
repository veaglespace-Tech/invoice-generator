import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { createInvoiceSchema, updateInvoiceStatusSchema } from '../validators/invoice.validator';
import { calculateInvoice, generateInvoiceNumber } from '../services/invoice.service';

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { is_deleted: false };

    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }

    const invoices = await prisma.invoice.findMany({
      where: filter,
      include: {
        customer: { select: { customer_name: true, company_name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const invoice = await prisma.invoice.findFirst({
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
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createInvoiceSchema.parse(req.body);

    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
      targetOrgId = req.body.organization_id;
    }

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    // Backend-side calculation engine
    const { calculatedItems, totals } = await calculateInvoice(targetOrgId, data.customer_id, data.items);
    
    // Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber(targetOrgId);

    const result = await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = updateInvoiceStatusSchema.parse(req.body);

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingInvoice = await prisma.invoice.findFirst({ where: filter });
    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, message: `Invoice marked as ${status}`, data: updatedInvoice });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const existingInvoice = await prisma.invoice.findFirst({ where: filter });
    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await prisma.invoice.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date(), status: 'CANCELLED' }
    });

    res.status(200).json({ success: true, message: 'Invoice deleted (cancelled)' });
  } catch (error) {
    next(error);
  }
};

import { generateInvoicePDF } from '../services/pdf.service';

export const downloadInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const invoice = await prisma.invoice.findFirst({
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

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

import { sendInvoiceEmail } from '../services/email.service';

export const sendInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: any = { id, is_deleted: false };
    if (req.user?.role !== 'SUPER_ADMIN') {
      filter.organization_id = req.user?.organization_id;
    }

    const invoice = await prisma.invoice.findFirst({
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

    await sendInvoiceEmail(invoice);

    res.status(200).json({ success: true, message: 'Invoice sent successfully via email' });
  } catch (error) {
    next(error);
  }
};
