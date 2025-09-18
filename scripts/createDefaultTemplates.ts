import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDefaultTemplates() {
  const templates = [
    {
      name: 'order_confirmation',
      subject: 'Order Confirmation #{{orderId}}',
      body: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Here are the details:</p>
        
        <h3>Order #{{orderId}}</h3>
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
            {{items}}
          </tbody>
        </table>
        
        <p><strong>Total: \${{total}}</strong></p>
        
        <p>We'll send you another email when your order ships.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/{{orderId}}" class="button">View Order Details</a></p>
      `,
      type: 'email'
    },
    {
      name: 'order_shipped',
      subject: 'Order #{{orderId}} Shipped',
      body: `
        <h2>Your Order Has Shipped!</h2>
        <p>Great news! Your order #{{orderId}} has been shipped and is on its way to you.</p>
        
        <p>You'll receive another email when your order is delivered.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/{{orderId}}" class="button">Track Order</a></p>
      `,
      type: 'email'
    },
    {
      name: 'order_delivered',
      subject: 'Order #{{orderId}} Delivered',
      body: `
        <h2>Your Order Has Been Delivered!</h2>
        <p>Wonderful news! Your order #{{orderId}} has been successfully delivered.</p>
        
        <p>We hope you love your new gemstone jewelry. If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/{{orderId}}" class="button">View Order Details</a></p>
      `,
      type: 'email'
    },
    {
      name: 'order_cancelled',
      subject: 'Order #{{orderId}} Cancelled',
      body: `
        <h2>Your Order Has Been Cancelled</h2>
        <p>We're sorry to inform you that your order #{{orderId}} has been cancelled.</p>
        
        <p>If you have any questions about this cancellation or would like to place a new order, please contact our customer service team.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact" class="button">Contact Support</a></p>
      `,
      type: 'email'
    },
    {
      name: 'password_reset',
      subject: 'Password Reset Request',
      body: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        
        <p><a href="{{resetUrl}}" class="button">Reset Password</a></p>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>This link will expire in 1 hour.</p>
      `,
      type: 'email'
    },
    {
      name: 'welcome_email',
      subject: 'Welcome to Shankarmala Gemstore!',
      body: `
        <h2>Welcome to Shankarmala Gemstore!</h2>
        <p>Dear {{firstName}},</p>
        <p>Welcome to our luxury gemstone collection! We're thrilled to have you as part of our community.</p>
        
        <p>As a welcome gift, enjoy 10% off your first purchase with code WELCOME10.</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop" class="button">Start Shopping</a></p>
        
        <p>If you have any questions, our customer service team is always here to help.</p>
      `,
      type: 'email'
    }
  ];

  console.log('Creating default notification templates...');
  
  for (const template of templates) {
    try {
      await prisma.notificationTemplate.upsert({
        where: { name: template.name },
        update: {
          subject: template.subject,
          body: template.body,
          type: template.type
        },
        create: template
      });
      console.log(`✓ Created/updated template: ${template.name}`);
    } catch (error) {
      console.error(`✗ Error creating template ${template.name}:`, error);
    }
  }
  
  console.log('Finished creating default notification templates.');
}

createDefaultTemplates()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });