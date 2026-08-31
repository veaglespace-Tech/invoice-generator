import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { Prisma, Role } from '@prisma/client';
import { createInvoiceSchema, updateInvoiceStatusSchema } from '../validators/invoice.validator';
import { calculateInvoice, generateInvoiceNumber } from '../services/invoice.service';

export const getNextInvoiceNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let targetOrgId = req.user?.organization_id;
    if (req.user?.role === Role.SUPER_ADMIN && req.query.organization_id) {
      targetOrgId = req.query.organization_id as string;
    }

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    const invoiceNumber = await generateInvoiceNumber(targetOrgId);
    res.status(200).json({ success: true, data: { invoice_number: invoiceNumber } });
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Prisma.InvoiceWhereInput = {};

    if (req.user?.role !== Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id as string;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: filter,
        include: {
          customer: { select: { customer_name: true, company_name: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where: filter })
    ]);

    res.status(200).json({ 
      success: true, 
      data: invoices, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
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
    if (req.user?.role === Role.SUPER_ADMIN && req.body.organization_id) {
      targetOrgId = req.body.organization_id;
    }

    if (!targetOrgId) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    // Backend-side calculation engine
    const { calculatedItems, totals } = await calculateInvoice(targetOrgId, data.customer_id, data.items);
    
    // Generate or Use provided Invoice Number
    let invoiceNumber = data.invoice_number;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(targetOrgId);
    }

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

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateInvoiceSchema.parse(req.body);

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: filter
    });

    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found or unauthorized' });
    }

    const targetOrgId = existingInvoice.organization_id;

    // Backend-side calculation engine
    const { calculatedItems, totals } = await calculateInvoice(targetOrgId, data.customer_id, data.items);
    
    // Use provided Invoice Number or keep existing
    const invoiceNumber = data.invoice_number || existingInvoice.invoice_number;

    const result = await prisma.$transaction(async (tx) => {
      // Delete existing line items
      await tx.invoiceItem.deleteMany({
        where: { invoice_id: id }
      });

      // Update invoice and insert new items
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
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
            action: 'INVOICE_UPDATED',
            entity_type: 'INVOICE',
            entity_id: invoice.id,
            description: `Invoice ${invoiceNumber} updated`
          }
        });
      }

      return invoice;
    });

    res.status(200).json({ success: true, message: 'Invoice updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = updateInvoiceStatusSchema.parse(req.body);

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
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

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }

    const existingInvoice = await prisma.invoice.findFirst({ where: filter });
    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Hard delete related payments to avoid foreign key constraint errors
    await prisma.payment.deleteMany({
      where: { invoice_id: id }
    });

    // Hard delete the invoice (InvoiceItem cascades automatically)
    await prisma.invoice.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Invoice permanently deleted' });
  } catch (error) {
    next(error);
  }
};

import { generateInvoicePDF } from '../services/pdf.service';

export const downloadInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
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

    const filter: Prisma.InvoiceWhereInput = { id };
    if (req.user?.role !== Role.SUPER_ADMIN) {
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
