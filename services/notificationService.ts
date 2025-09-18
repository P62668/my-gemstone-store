import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { EmailService } from './emailService';
import { sendNotificationToUser, sendNotificationToAdmins } from '../lib/websocket';

export interface CreateNotificationParams {
  userId: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  orderId?: number;
  link?: string;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'push';
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private static emailService = new EmailService();
  
  /**
   * Create a new notification for a user
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'info',
          orderId: params.orderId,
          link: params.link,
        },
      });
      
      // Send real-time notification via WebSocket
      sendNotificationToUser(params.userId, notification);
      
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Failed to create notification', error, params);
      throw error;
    }
  }

  /**
   * Create order-related notification and send email
   */
  static async createOrderNotification(userId: number, orderId: number, status: string) {
    const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
      pending: {
        title: 'Order Placed',
        message: `Your order #${orderId} has been placed successfully.`,
        type: 'success'
      },
      paid: {
        title: 'Payment Confirmed',
        message: `Payment for order #${orderId} has been confirmed.`,
        type: 'success'
      },
      processing: {
        title: 'Order Processing',
        message: `Your order #${orderId} is being processed.`,
        type: 'info'
      },
      shipped: {
        title: 'Order Shipped',
        message: `Your order #${orderId} has been shipped.`,
        type: 'info'
      },
      delivered: {
        title: 'Order Delivered',
        message: `Your order #${orderId} has been delivered.`,
        type: 'success'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${orderId} has been cancelled.`,
        type: 'warning'
      }
    };

    const notificationData = statusMessages[status] || {
      title: 'Order Update',
      message: `Your order #${orderId} status has been updated to ${status}.`,
      type: 'info'
    };

    // Create in-app notification
    const notification = await this.createNotification({
      userId,
      orderId,
      ...notificationData
    });
    
    // Send email notification
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true }
      });
      
      if (user && user.email) {
        // Get notification template for this event
        const template = await this.getNotificationTemplate(`order_${status}`);
        
        if (template) {
          // Use template for email
          await this.emailService.sendTemplateEmail(
            user.email,
            template.subject.replace('{{orderId}}', orderId.toString()),
            template.body
              .replace('{{firstName}}', user.firstName || 'Customer')
              .replace('{{orderId}}', orderId.toString())
          );
        } else {
          // Fallback to default emails
          switch (status) {
            case 'pending':
              await this.emailService.sendOrderConfirmation(
                user.email,
                orderId,
                0, // We would need to fetch the order total in a real implementation
                [] // We would need to fetch the order items in a real implementation
              );
              break;
            case 'shipped':
              await this.emailService.sendOrderShipped(
                user.email,
                orderId
              );
              break;
            case 'delivered':
              await this.emailService.sendOrderDelivered(
                user.email,
                orderId
              );
              break;
            case 'cancelled':
              await this.emailService.sendOrderCancelled(
                user.email,
                orderId
              );
              break;
          }
        }
      }
    } catch (emailError) {
      logger.error('[NotificationService] Failed to send email notification', emailError);
      // Don't fail the notification creation if email sending fails
    }
    
    return notification;
  }

  /**
   * Get unread notifications count for a user
   */
  static async getUnreadCount(userId: number) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
      return count;
    } catch (error) {
      logger.error('[NotificationService] Failed to get unread count', error, { userId });
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
        },
      });
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Failed to mark as read', error, { notificationId, userId });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('[NotificationService] Failed to mark all as read', error, { userId });
      throw error;
    }
  }

  /**
   * Create admin notification
   */
  static async createAdminNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
      // Create notification in database for admin panel
      const notification = await prisma.notification.create({
        data: {
          // Use a special user ID for admin notifications or create a system user
          userId: 0, // System notifications
          title,
          message,
          type,
        },
      });
      
      // Send real-time notification to all admins
      sendNotificationToAdmins(notification);
      
      return notification;
    } catch (error) {
      logger.error('[NotificationService] Failed to create admin notification', error);
      throw error;
    }
  }

  /**
   * Get notification template by name
   */
  static async getNotificationTemplate(name: string): Promise<NotificationTemplate | null> {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name }
      });
      return template as NotificationTemplate | null;
    } catch (error) {
      logger.error('[NotificationService] Failed to get notification template', error, { name });
      return null;
    }
  }

  /**
   * Create or update notification template
   */
  static async upsertNotificationTemplate(name: string, subject: string, body: string, type: 'email' | 'sms' | 'push' = 'email') {
    try {
      const template = await prisma.notificationTemplate.upsert({
        where: { name },
        update: { subject, body, type },
        create: { name, subject, body, type }
      });
      return template as NotificationTemplate;
    } catch (error) {
      logger.error('[NotificationService] Failed to upsert notification template', error, { name });
      throw error;
    }
  }

  /**
   * Get all notification templates
   */
  static async getAllTemplates() {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return templates as NotificationTemplate[];
    } catch (error) {
      logger.error('[NotificationService] Failed to get notification templates', error);
      throw error;
    }
  }

  /**
   * Delete notification template
   */
  static async deleteTemplate(id: number) {
    try {
      await prisma.notificationTemplate.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('[NotificationService] Failed to delete notification template', error, { id });
      throw error;
    }
  }
}