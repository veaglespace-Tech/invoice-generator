const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendOTP = async (email, otp) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\n=============================================');
    console.warn(`[DEVELOPMENT] OTP for ${email} is: ${otp}`);
    console.warn('=============================================\n');
    return; // Fallback to console log in dev if no SMTP set
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Veagle Space" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Super Admin Login OTP',
      text: `Your OTP for Super Admin Login is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Super Admin Login OTP</h2>
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 16px; color: #334155;">You recently attempted to login to the Super Admin portal. Please use the following OTP to complete your login:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 5px; padding: 10px 20px; background-color: #f1f5f9; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b; text-align: center;">This OTP is valid for 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTP
};
