const nodemailer = require('nodemailer');
const { SMTP } = require('../config/constants');

const createEmailTemplate = (type, data) => {
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to Our Platform',
        html: `
          <h1>Welcome ${data.name}!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board.</p>
          <p>Get started by exploring our products.</p>
        `,
      };
    
    case 'orderConfirmation':
      return {
        subject: `Order Confirmation #${data.orderId}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
          <p>Order ID: ${data.orderId}</p>
          <p>Total Amount: $${data.amount}</p>
          <p>Estimated Delivery: ${data.estimatedDelivery}</p>
        `,
      };
    
    case 'passwordReset':
      return {
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${data.resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `,
      };
    
    default:
      throw new Error('Invalid email template type');
  }
};

const sendEmail = async ({ to, type, data, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP.HOST,
      port: SMTP.PORT,
      secure: SMTP.PORT === 465,
      auth: {
        user: SMTP.USER,
        pass: SMTP.PASS,
      },
    });

    let emailContent;
    if (type) {
      emailContent = createEmailTemplate(type, data);
    } else {
      emailContent = { subject, html };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${SMTP.USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return info;
  } catch (error) {
    throw new Error('Failed to send email:', error);
  }
};

module.exports = sendEmail; 