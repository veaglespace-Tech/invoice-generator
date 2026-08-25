import nodemailer from 'nodemailer';
import { generateInvoicePDF } from './pdf.service';
import { prisma } from '../server';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendInvoiceEmail = async (invoice: any) => {
  const pdfBuffer = await generateInvoicePDF(invoice);

  const subject = `Invoice #${invoice.invoice_number} from ${invoice.organization.name}`;
  const text = `Dear ${invoice.customer.customer_name},\n\nPlease find attached your invoice #${invoice.invoice_number} for the amount of ${invoice.organization.currency} ${invoice.grand_total}.\n\nThank you for your business!\n\nBest Regards,\n${invoice.organization.name}`;

  const mailOptions = {
    from: `"${invoice.organization.name}" <${invoice.organization.email}>`,
    to: invoice.customer.email,
    subject,
    text,
    attachments: [
      {
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'SENT' }
    });

    return info;
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
