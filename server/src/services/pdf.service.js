'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.generateInvoicePDF = void 0;
var _puppeteer = _interopRequireDefault(require('puppeteer'));
var _ejs = _interopRequireDefault(require('ejs'));
var _path = _interopRequireDefault(require('path'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const generateInvoicePDF = async (invoiceData) => {
  const templatePath = _path.default.join(
    __dirname,
    '../templates/invoice.ejs'
  );

  // Render HTML with EJS
  const html = await _ejs.default.renderFile(templatePath, {
    invoice: invoiceData
  });

  // Launch Puppeteer and generate PDF
  const browser = await _puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set HTML content
  await page.setContent(html, {
    waitUntil: 'load'
  });

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
