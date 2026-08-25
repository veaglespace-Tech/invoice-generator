"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdf_service_1 = require("./pdf.service");
const server_1 = require("../server");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});
const sendInvoiceEmail = async (invoice) => {
    const pdfBuffer = await (0, pdf_service_1.generateInvoicePDF)(invoice);
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
        await server_1.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'SENT' }
        });
        return info;
    }
    catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
exports.sendInvoiceEmail = sendInvoiceEmail;
//# sourceMappingURL=email.service.js.map