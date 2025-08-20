import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  orderDate: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@shankarmala.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const subject = `Order Confirmation - #${data.orderId}`;
    const html = this.generateOrderConfirmationHTML(data);
    const text = this.generateOrderConfirmationText(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderShipped(data: OrderEmailData): Promise<boolean> {
    const subject = `Your Order #${data.orderId} Has Been Shipped!`;
    const html = this.generateOrderShippedHTML(data);
    const text = this.generateOrderShippedText(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderDelivered(data: OrderEmailData): Promise<boolean> {
    const subject = `Your Order #${data.orderId} Has Been Delivered!`;
    const html = this.generateOrderDeliveredHTML(data);
    const text = this.generateOrderDeliveredText(data);

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - Shankarmala';
    const html = this.generatePasswordResetHTML(resetUrl);
    const text = this.generatePasswordResetText(resetUrl);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  async sendEmailVerification(email: string, verifyToken: string): Promise<boolean> {
    const verifyUrl = `${process.env.PUBLIC_BASE_URL}/verify-email?token=${verifyToken}`;
    const subject = 'Verify Your Email - Shankarmala';
    const html = this.generateEmailVerificationHTML(verifyUrl);
    const text = this.generateEmailVerificationText(verifyUrl);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  private generateOrderConfirmationHTML(data: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p>Thank you for your purchase, ${data.customerName}!</p>
            </div>
            <div class="content">
              <h2>Order #${data.orderId}</h2>
              <p>We've received your order and are preparing it for shipment.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <span>${item.name} (Qty: ${item.quantity})</span>
                    <span>₹${item.price.toLocaleString('en-IN')}</span>
                  </div>
                `).join('')}
                <div class="total">
                  Total: ₹${data.total.toLocaleString('en-IN')}
                </div>
              </div>
              
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              
              <a href="${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}" class="button">View Order Details</a>
              
              <p>We'll send you an email when your order ships with tracking information.</p>
              
              <p>If you have any questions, please contact us at support@shankarmala.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOrderConfirmationText(data: OrderEmailData): string {
    return `
Order Confirmation - #${data.orderId}

Dear ${data.customerName},

Thank you for your purchase! We've received your order and are preparing it for shipment.

Order Details:
${data.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price.toLocaleString('en-IN')}`).join('\n')}

Total: ₹${data.total.toLocaleString('en-IN')}
Order Date: ${data.orderDate}

View your order: ${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}

We'll send you an email when your order ships with tracking information.

If you have any questions, please contact us at support@shankarmala.com

Best regards,
The Shankarmala Team
    `;
  }

  private generateOrderShippedHTML(data: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .tracking { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Your Order Has Been Shipped!</h1>
              <p>Order #${data.orderId} is on its way to you!</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              
              <p>Great news! Your order has been shipped and is on its way to you.</p>
              
              ${data.trackingNumber ? `
                <div class="tracking">
                  <h3>Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                  ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
                </div>
              ` : ''}
              
              <a href="${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}" class="button">Track Your Order</a>
              
              <p>We'll notify you when your package is delivered.</p>
              
              <p>Thank you for choosing Shankarmala!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOrderShippedText(data: OrderEmailData): string {
    return `
Your Order Has Been Shipped! - #${data.orderId}

Dear ${data.customerName},

Great news! Your order has been shipped and is on its way to you.

${data.trackingNumber ? `
Tracking Information:
Tracking Number: ${data.trackingNumber}
${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}
` : ''}

Track your order: ${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}

We'll notify you when your package is delivered.

Thank you for choosing Shankarmala!

Best regards,
The Shankarmala Team
    `;
  }

  private generateOrderDeliveredHTML(data: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Delivered</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Your Order Has Been Delivered!</h1>
              <p>Order #${data.orderId} has arrived!</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              
              <p>Your order has been successfully delivered! We hope you love your new gemstone.</p>
              
              <a href="${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}" class="button">View Order Details</a>
              
              <p>If you're satisfied with your purchase, we'd love to hear from you! Please consider leaving a review.</p>
              
              <p>Thank you for choosing Shankarmala!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOrderDeliveredText(data: OrderEmailData): string {
    return `
Your Order Has Been Delivered! - #${data.orderId}

Dear ${data.customerName},

Your order has been successfully delivered! We hope you love your new gemstone.

View order details: ${process.env.PUBLIC_BASE_URL}/orders/${data.orderId}

If you're satisfied with your purchase, we'd love to hear from you! Please consider leaving a review.

Thank you for choosing Shankarmala!

Best regards,
The Shankarmala Team
    `;
  }

  private generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>You requested a password reset for your Shankarmala account.</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p>If you didn't request this, please ignore this email.</p>
              
              <p>This link will expire in 1 hour.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generatePasswordResetText(resetUrl: string): string {
    return `
Password Reset Request - Shankarmala

You requested a password reset for your Shankarmala account.

Reset your password: ${resetUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour.

Best regards,
The Shankarmala Team
    `;
  }

  private generateEmailVerificationHTML(verifyUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Welcome to Shankarmala! Please verify your email address to complete your registration.</p>
              
              <a href="${verifyUrl}" class="button">Verify Email</a>
              
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateEmailVerificationText(verifyUrl: string): string {
    return `
Verify Your Email - Shankarmala

Welcome to Shankarmala! Please verify your email address to complete your registration.

Verify your email: ${verifyUrl}

If you didn't create an account, please ignore this email.

Best regards,
The Shankarmala Team
    `;
  }
}

export const emailService = new EmailService();
