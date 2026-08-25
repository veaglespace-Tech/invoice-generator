import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';

export const generateInvoicePDF = async (invoiceData: any): Promise<Buffer> => {
  const templatePath = path.join(__dirname, '../templates/invoice.ejs');
  
  // Render HTML with EJS
  const html = await ejs.renderFile(templatePath, { invoice: invoiceData });

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set HTML content
  await page.setContent(html, { waitUntil: 'load' });

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
