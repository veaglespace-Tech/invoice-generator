"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const generateInvoicePDF = async (invoiceData) => {
    const templatePath = path_1.default.join(__dirname, '../templates/invoice.ejs');
    // Render HTML with EJS
    const html = await ejs_1.default.renderFile(templatePath, { invoice: invoiceData });
    // Launch Puppeteer and generate PDF
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Set HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        }
    });
    await browser.close();
    return Buffer.from(pdfBuffer);
};
exports.generateInvoicePDF = generateInvoicePDF;
//# sourceMappingURL=pdf.service.js.map