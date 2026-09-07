'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.sendInvoiceEmail = void 0;
var _nodemailer = _interopRequireDefault(require('nodemailer'));
var _server = require('../server');

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}

// Fallback SMTP accounts provided by the user
const smtpAccounts = [
  { user: 'invoice@info.veaglespace.com', pass: 'Veagle@12345' },
  { user: 'invoice1@info.veaglespace.com', pass: 'Veagle@12345' },
  { user: 'invoice2@info.veaglespace.com', pass: 'Veagle@12345' }
];

// Helper to create a transporter for a specific account
const getTransporter = (account) => {
  return _nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
};

const sendInvoiceEmail = async (invoice, pdfBase64) => {
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  const subject = `Invoice #${invoice.invoice_number} from ${invoice.organization.name}`;
  const text = `Dear ${invoice.customer.customer_name},\n\nPlease find attached your invoice #${invoice.invoice_number} for the amount of ${invoice.organization.currency} ${invoice.grand_total}.\n\nThank you for your business!\n\nBest Regards,\n${invoice.organization.name}`;
  
  let lastError = null;

  // Loop through accounts and try sending. If one hits a limit, it fails and loops to the next.
  for (let i = 0; i < smtpAccounts.length; i++) {
    const account = smtpAccounts[i];
    const transporter = getTransporter(account);

    const mailOptions = {
      // Must send FROM the authenticated user to avoid SMTP rejection, but use organization name
      from: `"${invoice.organization.name}" <${account.user}>`,
      // Replies go directly to the organization
      replyTo: invoice.organization.email,
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
      console.log(`Attempting to send email via ${account.user}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully via ${account.user}: ${info.messageId}`);
      
      // Update invoice status in database
      await _server.prisma.invoice.update({
        where: {
          id: invoice.id
        },
        data: {
          status: 'SENT'
        }
      });
      
      // Successfully sent, return info and exit function
      return info;
    } catch (error) {
      console.error(`Failed to send email via ${account.user}: ${error.message}`);
      lastError = error;
      // Loop will continue and try the next account
    }
  }

  // If the loop finishes and we are here, ALL accounts failed
  throw new Error(`Failed to send email after trying all ${smtpAccounts.length} accounts. Last error: ${lastError?.message}`);
};

exports.sendInvoiceEmail = sendInvoiceEmail;

const sendWelcomeEmail = async (org, user) => {
  const subject = `Welcome to Veagle Space Invoice Generator!`;
  const text = `Dear ${user.name},\n\nWelcome to Veagle Space Invoice Generator! Your organization "${org.name}" has been successfully registered.\n\nYou can now log in and start generating professional invoices for your business.\n\nBest Regards,\nThe Veagle Space Team`;
  
  let lastError = null;

  for (let i = 0; i < smtpAccounts.length; i++) {
    const account = smtpAccounts[i];
    const transporter = getTransporter(account);

    const mailOptions = {
      from: `"Veagle Space" <${account.user}>`,
      to: user.email,
      subject,
      text,
    };

    try {
      console.log(`Attempting to send welcome email via ${account.user}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully via ${account.user}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Failed to send welcome email via ${account.user}: ${error.message}`);
      lastError = error;
    }
  }

  console.error(`Failed to send welcome email after trying all accounts. Last error: ${lastError?.message}`);
};

exports.sendWelcomeEmail = sendWelcomeEmail;
