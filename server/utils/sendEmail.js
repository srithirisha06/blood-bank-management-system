import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const message = {
        from: `${process.env.FROM_NAME || 'Blood Bank System'} <${process.env.FROM_EMAIL || 'noreply@bloodbank.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #D32F2F;">${options.subject}</h2>
          <p>${options.message}</p>
        </div>`
      };

      const info = await transporter.sendMail(message);
      console.log(`[Email Sent] ID: ${info.messageId} to ${options.email}`);
      return info;
    } else {
      console.log(`[Email Mock Logger] To: ${options.email} | Subject: ${options.subject} | Content: ${options.message}`);
      return { mock: true };
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${options.email}: ${error.message}`);
    return null;
  }
};

export default sendEmail;
