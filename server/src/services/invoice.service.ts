import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { prisma } from '../server';

interface InvoiceItemInput {
  product_id?: string | null;
  description: string;
  quantity: number;
  unit?: string | null;
  rate: number;
  discount: number;
  tax_rate: number;
}

export const calculateInvoice = async (
  organizationId: string,
  customerId: string,
  items: InvoiceItemInput[]
) => {
  // Fetch org and customer to determine state for GST
  const [org, customer] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    prisma.customer.findUnique({ where: { id: customerId } })
  ]);

  if (!org || !customer) {
    throw new Error('Organization or Customer not found');
  }

  const isInterState = org.state?.toLowerCase() !== customer.state?.toLowerCase();
  
  let subtotal = new Decimal(0);
  let totalDiscount = new Decimal(0);
  let totalTaxableAmount = new Decimal(0);
  let totalCGST = new Decimal(0);
  let totalSGST = new Decimal(0);
  let totalIGST = new Decimal(0);

  const calculatedItems = items.map((item) => {
    const qty = new Decimal(item.quantity);
    const rate = new Decimal(item.rate);
    const itemDiscount = new Decimal(item.discount);
    const taxRate = new Decimal(item.tax_rate);

    const amount = qty.mul(rate);
    const taxableAmount = amount.sub(itemDiscount);
    
    // Tax calculation
    const taxAmount = taxableAmount.mul(taxRate).div(100);

    subtotal = subtotal.add(amount);
    totalDiscount = totalDiscount.add(itemDiscount);
    totalTaxableAmount = totalTaxableAmount.add(taxableAmount);

    let cgst = new Decimal(0);
    let sgst = new Decimal(0);
    let igst = new Decimal(0);

    if (isInterState) {
      igst = taxAmount;
      totalIGST = totalIGST.add(igst);
    } else {
      cgst = taxAmount.div(2);
      sgst = taxAmount.div(2);
      totalCGST = totalCGST.add(cgst);
      totalSGST = totalSGST.add(sgst);
    }

    return {
      product_id: item.product_id,
      description: item.description,
      quantity: qty.toNumber(),
      unit: item.unit,
      rate: rate.toNumber(),
      discount: itemDiscount.toNumber(),
      tax_rate: taxRate.toNumber(),
      tax_amount: taxAmount.toDecimalPlaces(2).toNumber(),
      amount: taxableAmount.toDecimalPlaces(2).toNumber() // Subtotal before tax for this item, matching the schema
    };
  });

  const taxTotal = totalCGST.add(totalSGST).add(totalIGST);
  const grandTotalExact = totalTaxableAmount.add(taxTotal);
  const grandTotalRounded = grandTotalExact.round();
  const roundOff = grandTotalRounded.sub(grandTotalExact);

  return {
    calculatedItems,
    totals: {
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      discount: totalDiscount.toDecimalPlaces(2).toNumber(),
      taxable_amount: totalTaxableAmount.toDecimalPlaces(2).toNumber(),
      tax_total: taxTotal.toDecimalPlaces(2).toNumber(),
      CGST: totalCGST.toDecimalPlaces(2).toNumber(),
      SGST: totalSGST.toDecimalPlaces(2).toNumber(),
      IGST: totalIGST.toDecimalPlaces(2).toNumber(),
      round_off: roundOff.toDecimalPlaces(2).toNumber(),
      grand_total: grandTotalRounded.toNumber()
    }
  };
};

export const generateInvoiceNumber = async (organizationId: string) => {
  const settings = await prisma.invoiceSetting.findUnique({
    where: { organization_id: organizationId }
  });

  const prefix = settings?.prefix || 'INV-';
  const formatLength = settings?.number_format.length || 4;

  const count = await prisma.invoice.count({
    where: { organization_id: organizationId }
  });

  const nextNumber = count + 1;
  const paddedNumber = String(nextNumber).padStart(formatLength, '0');

  return `${prefix}${paddedNumber}`;
};
