const nodemailer = require('nodemailer');
const { SMTP } = require('../config/constants');
const { createEmailTemplate } = require('../utils/sendEmail');
const { logger } = require('../middleware/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP.HOST,
      port: SMTP.PORT,
      secure: SMTP.PORT === 465,
      auth: {
        user: SMTP.USER,
        pass: SMTP.PASS,
      },
    });
  }

  async sendEmail(options) {
    try {
      const { to, type, data, subject, html } = options;
      
      let emailContent;
      if (type) {
        emailContent = createEmailTemplate(type, data);
      } else {
        emailContent = { subject, html };
      }

      const info = await this.transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${SMTP.USER}>`,
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      type: 'welcome',
      data: { name: user.name },
    });
  }

  async sendOrderConfirmation(order, user) {
    return this.sendEmail({
      to: user.email,
      type: 'orderConfirmation',
      data: {
        orderId: order._id,
        amount: order.totalAmount,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async sendPasswordReset(user, resetToken) {
    return this.sendEmail({
      to: user.email,
      type: 'passwordReset',
      data: {
        resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
      },
    });
  }
}

module.exports = new EmailService(); 