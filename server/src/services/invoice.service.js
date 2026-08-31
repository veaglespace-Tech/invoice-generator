'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.generateInvoiceNumber = exports.calculateInvoice = void 0;
var _client = require('@prisma/client');
var _decimal = _interopRequireDefault(require('decimal.js'));
var _server = require('../server');
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const calculateInvoice = async (organizationId, customerId, items) => {
  // Fetch org and customer to determine state for GST
  const [org, customer] = await Promise.all([
    _server.prisma.organization.findUnique({
      where: {
        id: organizationId
      }
    }),
    _server.prisma.customer.findUnique({
      where: {
        id: customerId
      }
    })
  ]);
  if (!org || !customer) {
    throw new Error('Organization or Customer not found');
  }
  const isInterState =
    org.state?.toLowerCase() !== customer.state?.toLowerCase();
  let subtotal = new _decimal.default(0);
  let totalDiscount = new _decimal.default(0);
  let totalTaxableAmount = new _decimal.default(0);
  let totalCGST = new _decimal.default(0);
  let totalSGST = new _decimal.default(0);
  let totalIGST = new _decimal.default(0);
  const calculatedItems = items.map((item) => {
    const qty = new _decimal.default(item.quantity);
    const rate = new _decimal.default(item.rate);
    const itemDiscount = new _decimal.default(item.discount);
    const taxRate = new _decimal.default(item.tax_rate);
    const amount = qty.mul(rate);
    const taxableAmount = amount.sub(itemDiscount);

    // Tax calculation
    const taxAmount = taxableAmount.mul(taxRate).div(100);
    subtotal = subtotal.add(amount);
    totalDiscount = totalDiscount.add(itemDiscount);
    totalTaxableAmount = totalTaxableAmount.add(taxableAmount);
    let cgst = new _decimal.default(0);
    let sgst = new _decimal.default(0);
    let igst = new _decimal.default(0);
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
exports.calculateInvoice = calculateInvoice;
const generateInvoiceNumber = async (organizationId) => {
  const settings = await _server.prisma.invoiceSetting.findUnique({
    where: {
      organization_id: organizationId
    }
  });
  let prefix = settings?.prefix;
  const formatLength = settings?.number_format?.length || 4;
  if (!prefix || prefix === 'INV-') {
    const org = await _server.prisma.organization.findUnique({
      where: {
        id: organizationId
      }
    });
    const orgName = org?.legal_name || org?.name || 'INV';
    // Clean and take first 3 letters uppercase
    const cleanName = orgName.replace(/[^a-zA-Z]/g, '');
    prefix =
      (cleanName.length >= 3
        ? cleanName.substring(0, 3)
        : cleanName.padEnd(3, 'X')
      ).toUpperCase() + '-';
  }

  // Find the highest sequence number for this prefix
  const lastInvoice = await _server.prisma.invoice.findFirst({
    where: {
      organization_id: organizationId,
      invoice_number: {
        startsWith: prefix
      }
    },
    orderBy: {
      invoice_number: 'desc'
    }
  });
  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoice_number) {
    // Extract the numeric part at the end
    const match = lastInvoice.invoice_number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const paddedNumber = String(nextNumber).padStart(formatLength, '0');
  return `${prefix}${paddedNumber}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
