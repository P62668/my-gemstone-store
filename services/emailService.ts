import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { NotificationService } from './notificationService';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter with environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'your@email.com',
        pass: process.env.EMAIL_PASS || 'yourpassword',
      },
    });
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Shankarmala Gemstore" <no-reply@shankarmala.com>',
        ...options,
      });
      
      logger.info('[EmailService] Email sent', { messageId: info.messageId });
    } catch (error) {
      logger.error('[EmailService] Failed to send email', error, options);
      throw error;
    }
  }

  /**
   * Send template-based email
   */
  async sendTemplateEmail(to: string, subject: string, body: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #8B4513; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shankarmala Gemstore</h1>
            </div>
            <div class="content">
              ${body}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Shankarmala Gemstore. All rights reserved.</p>
              <p>This email was sent to ${to} because you are registered on our platform.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({ to, subject, html });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    orderId: number,
    total: number,
    items: { name: string; quantity: number; price: number }[]
  ): Promise<void> {
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('order_confirmation');
    
    if (template) {
      // Use template
      const itemsHtml = items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `).join('');
      
      const body = template.body
        .replace('{{orderId}}', orderId.toString())
        .replace('{{total}}', total.toFixed(2))
        .replace('{{items}}', itemsHtml);
      
      await this.sendTemplateEmail(to, template.subject.replace('{{orderId}}', orderId.toString()), body);
    } else {
      // Fallback to hardcoded template
      const itemsHtml = items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Here are the details:</p>
        
        <h3>Order #${orderId}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Item</th>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Price</th>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        
        <p>We'll send you another email when your order ships.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/${orderId}" class="button">View Order Details</a></p>
      `;

      await this.sendTemplateEmail(to, `Order Confirmation #${orderId}`, html);
    }
  }

  /**
   * Send order shipped email
   */
  async sendOrderShipped(to: string, orderId: number): Promise<void> {
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('order_shipped');
    
    if (template) {
      // Use template
      const body = template.body.replace('{{orderId}}', orderId.toString());
      await this.sendTemplateEmail(to, template.subject.replace('{{orderId}}', orderId.toString()), body);
    } else {
      // Fallback to hardcoded template
      const html = `
        <h2>Your Order Has Shipped!</h2>
        <p>Great news! Your order #${orderId} has been shipped and is on its way to you.</p>
        
        <p>You'll receive another email when your order is delivered.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/${orderId}" class="button">Track Order</a></p>
      `;

      await this.sendTemplateEmail(to, `Order #${orderId} Shipped`, html);
    }
  }

  /**
   * Send order delivered email
   */
  async sendOrderDelivered(to: string, orderId: number): Promise<void> {
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('order_delivered');
    
    if (template) {
      // Use template
      const body = template.body.replace('{{orderId}}', orderId.toString());
      await this.sendTemplateEmail(to, template.subject.replace('{{orderId}}', orderId.toString()), body);
    } else {
      // Fallback to hardcoded template
      const html = `
        <h2>Your Order Has Been Delivered!</h2>
        <p>Wonderful news! Your order #${orderId} has been successfully delivered.</p>
        
        <p>We hope you love your new gemstone jewelry. If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/${orderId}" class="button">View Order Details</a></p>
      `;

      await this.sendTemplateEmail(to, `Order #${orderId} Delivered`, html);
    }
  }

  /**
   * Send order cancelled email
   */
  async sendOrderCancelled(to: string, orderId: number): Promise<void> {
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('order_cancelled');
    
    if (template) {
      // Use template
      const body = template.body.replace('{{orderId}}', orderId.toString());
      await this.sendTemplateEmail(to, template.subject.replace('{{orderId}}', orderId.toString()), body);
    } else {
      // Fallback to hardcoded template
      const html = `
        <h2>Your Order Has Been Cancelled</h2>
        <p>We're sorry to inform you that your order #${orderId} has been cancelled.</p>
        
        <p>If you have any questions about this cancellation or would like to place a new order, please contact our customer service team.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact" class="button">Contact Support</a></p>
      `;

      await this.sendTemplateEmail(to, `Order #${orderId} Cancelled`, html);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('password_reset');
    
    if (template) {
      // Use template
      const body = template.body
        .replace('{{resetUrl}}', resetUrl)
        .replace('{{resetToken}}', resetToken);
      await this.sendTemplateEmail(to, template.subject, body);
    } else {
      // Fallback to hardcoded template
      const html = `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        
        <p><a href="${resetUrl}" class="button">Reset Password</a></p>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>This link will expire in 1 hour.</p>
      `;

      await this.sendTemplateEmail(to, 'Password Reset Request', html);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    // Try to get template from database
    const template = await NotificationService.getNotificationTemplate('welcome_email');
    
    if (template) {
      // Use template
      const body = template.body.replace('{{firstName}}', firstName);
      await this.sendTemplateEmail(to, template.subject, body);
    } else {
      // Fallback to hardcoded template
      const html = `
        <h2>Welcome to Shankarmala Gemstore!</h2>
        <p>Dear ${firstName},</p>
        <p>Welcome to our luxury gemstone collection! We're thrilled to have you as part of our community.</p>
        
        <p>As a welcome gift, enjoy 10% off your first purchase with code WELCOME10.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop" class="button">Start Shopping</a></p>
        
        <p>If you have any questions, our customer service team is always here to help.</p>
      `;

      await this.sendTemplateEmail(to, 'Welcome to Shankarmala Gemstore!', html);
    }
  }
}