import { NotificationService } from '../../services/notificationService';
import { prisma } from '../../lib/prisma';

// Mock prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock EmailService
jest.mock('../../services/emailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue({}),
    sendOrderShipped: jest.fn().mockResolvedValue({}),
    sendOrderDelivered: jest.fn().mockResolvedValue({}),
    sendOrderCancelled: jest.fn().mockResolvedValue({}),
  })),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification({
        userId: 1,
        title: 'Test Notification',
        message: 'This is a test notification',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'info',
          orderId: undefined,
          link: undefined,
        },
      });
      expect(result).toEqual(mockNotification);
    });

    it('should handle errors when creating a notification', async () => {
      (prisma.notification.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        NotificationService.createNotification({
          userId: 1,
          title: 'Test Notification',
          message: 'This is a test notification',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('createOrderNotification', () => {
    it('should create an order notification and send email', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        title: 'Order Placed',
        message: 'Your order #123 has been placed successfully.',
        type: 'success',
        orderId: 123,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        firstName: 'Test',
      });

      const result = await NotificationService.createOrderNotification(1, 123, 'pending');

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { email: true, firstName: true },
      });
      expect(result).toEqual(mockNotification);
    });

    it('should handle different order statuses', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue({});
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        firstName: 'Test',
      });

      // Test shipped status
      await NotificationService.createOrderNotification(1, 123, 'shipped');
      expect(prisma.notification.create).toHaveBeenCalled();

      // Test delivered status
      await NotificationService.createOrderNotification(1, 123, 'delivered');
      expect(prisma.notification.create).toHaveBeenCalled();

      // Test cancelled status
      await NotificationService.createOrderNotification(1, 123, 'cancelled');
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread notification count', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(5);

      const result = await NotificationService.getUnreadCount(1);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 1,
          read: false,
        },
      });
      expect(result).toBe(5);
    });

    it('should return 0 if there is an error', async () => {
      (prisma.notification.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await NotificationService.getUnreadCount(1);

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        read: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.markAsRead(1, 1);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 1,
        },
        data: {
          read: true,
        },
      });
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const mockResult = { count: 3 };

      (prisma.notification.updateMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await NotificationService.markAllAsRead(1);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          read: false,
        },
        data: {
          read: true,
        },
      });
      expect(result).toEqual(mockResult);
    });
  });
});