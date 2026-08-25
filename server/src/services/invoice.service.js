"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceNumber = exports.calculateInvoice = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const server_1 = require("../server");
const calculateInvoice = async (organizationId, customerId, items) => {
    // Fetch org and customer to determine state for GST
    const [org, customer] = await Promise.all([
        server_1.prisma.organization.findUnique({ where: { id: organizationId } }),
        server_1.prisma.customer.findUnique({ where: { id: customerId } })
    ]);
    if (!org || !customer) {
        throw new Error('Organization or Customer not found');
    }
    const isInterState = org.state?.toLowerCase() !== customer.state?.toLowerCase();
    let subtotal = new decimal_js_1.default(0);
    let totalDiscount = new decimal_js_1.default(0);
    let totalTaxableAmount = new decimal_js_1.default(0);
    let totalCGST = new decimal_js_1.default(0);
    let totalSGST = new decimal_js_1.default(0);
    let totalIGST = new decimal_js_1.default(0);
    const calculatedItems = items.map((item) => {
        const qty = new decimal_js_1.default(item.quantity);
        const rate = new decimal_js_1.default(item.rate);
        const itemDiscount = new decimal_js_1.default(item.discount);
        const taxRate = new decimal_js_1.default(item.tax_rate);
        const amount = qty.mul(rate);
        const taxableAmount = amount.sub(itemDiscount);
        // Tax calculation
        const taxAmount = taxableAmount.mul(taxRate).div(100);
        subtotal = subtotal.add(amount);
        totalDiscount = totalDiscount.add(itemDiscount);
        totalTaxableAmount = totalTaxableAmount.add(taxableAmount);
        let cgst = new decimal_js_1.default(0);
        let sgst = new decimal_js_1.default(0);
        let igst = new decimal_js_1.default(0);
        if (isInterState) {
            igst = taxAmount;
            totalIGST = totalIGST.add(igst);
        }
        else {
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
    const settings = await server_1.prisma.invoiceSetting.findUnique({
        where: { organization_id: organizationId }
    });
    const prefix = settings?.prefix || 'INV-';
    const formatLength = settings?.number_format.length || 4;
    const count = await server_1.prisma.invoice.count({
        where: { organization_id: organizationId }
    });
    const nextNumber = count + 1;
    const paddedNumber = String(nextNumber).padStart(formatLength, '0');
    return `${prefix}${paddedNumber}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
//# sourceMappingURL=invoice.service.js.map