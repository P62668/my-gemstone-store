import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute a database transaction with automatic rollback on error
 */
export async function executeTransaction<T>(
  operations: (tx: PrismaClient) => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
  } = {}
): Promise<TransactionResult<T>> {
  const { maxRetries = 3, timeout = 30000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx: any) => {
          return await operations(tx);
        },
        {
          maxWait: timeout,
          timeout: timeout,
        }
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      lastError = error as Error;
      logger.error(`Transaction attempt ${attempt} failed`, undefined, lastError);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError.message,
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Transaction failed after all retries',
  };
}

/**
 * Create order with inventory updates
 */
export async function createOrderWithInventoryUpdate(orderData: {
  userId: number;
  items: Array<{
    gemstoneId: number;
    quantity: number;
    price: number;
  }>;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  totalAmount: number;
}): Promise<TransactionResult<{ orderId: number; orderNumber: string }>> {
  return executeTransaction(async (tx) => {
    // 1. Validate inventory availability
    for (const item of orderData.items) {
      const gemstone = await tx.gemstone.findUnique({
        where: { id: item.gemstoneId },
        select: { id: true, stockCount: true, active: true },
      });

      if (!gemstone || !gemstone.active) {
        throw new Error(`Gemstone ${item.gemstoneId} is not available`);
      }

      if (gemstone.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for gemstone ${item.gemstoneId}`);
      }
    }

    // 2. Create order
    const order = await tx.order.create({
      data: {
        userId: orderData.userId,
        orderNumber: generateOrderNumber(),
        status: 'pending',
        total: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        items: {
          create: orderData.items.map(item => ({
            gemstoneId: item.gemstoneId,
            quantity: item.quantity,
            price: item.price,

          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Update inventory
    for (const item of orderData.items) {
      await tx.gemstone.update({
        where: { id: item.gemstoneId },
        data: {
                  stockCount: {
          decrement: item.quantity,
        },
        },
      });
    }

    // 4. Create order status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        comment: 'Order created',
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber || '',
    };
  });
}

/**
 * Process payment and update order status
 */
export async function processPaymentAndUpdateOrder(
  orderId: number,
  paymentData: {
    paymentIntentId: string;
    amount: number;
    status: string;
  }
): Promise<TransactionResult<{ success: boolean }>> {
  return executeTransaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Order is not in pending status');
    }

    // Update order with payment information
    const newStatus = paymentData.status === 'succeeded' ? 'paid' : 'payment_failed';
    
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentIntentId: paymentData.paymentIntentId,

      },
    });

    // Create status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: newStatus,
        comment: paymentData.status === 'succeeded' 
          ? 'Payment processed successfully' 
          : 'Payment failed',
      },
    });

    // If payment failed, restore inventory
    if (paymentData.status !== 'succeeded') {
      for (const item of order.items) {
        await tx.gemstone.update({
          where: { id: item.gemstoneId },
          data: {
            stockCount: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return { success: paymentData.status === 'succeeded' };
  });
}

/**
 * Cancel order and restore inventory
 */
export async function cancelOrderAndRestoreInventory(
  orderId: number,
  reason: string
): Promise<TransactionResult<{ success: boolean }>> {
  return executeTransaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered order');
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',

      },
    });

    // Restore inventory
    for (const item of order.items) {
      await tx.gemstone.update({
        where: { id: item.gemstoneId },
        data: {
          stockCount: {
            increment: item.quantity,
          },
        },
      });
    }

    // Create status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: orderId,
        status: 'cancelled',
        comment: reason,
      },
    });

    return { success: true };
  });
}

/**
 * Update user profile with validation
 */
export async function updateUserProfile(
  userId: number,
  profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
  }
): Promise<TransactionResult<{ user: any }>> {
  return executeTransaction(async (tx) => {
    // Validate user exists
    const existingUser = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update user profile
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: profileData,
    });

    return { user: updatedUser };
  });
}

/**
 * Bulk update gemstone inventory
 */
export async function bulkUpdateInventory(
  updates: Array<{
    gemstoneId: number;
    stockQuantity: number;
    price?: number;
    active?: boolean;
  }>
): Promise<TransactionResult<{ updated: number; errors: string[] }>> {
  return executeTransaction(async (tx) => {
    const errors: string[] = [];
    let updated = 0;

    for (const update of updates) {
      try {
        await tx.gemstone.update({
          where: { id: update.gemstoneId },
          data: {
            stockCount: update.stockQuantity,
            ...(update.price !== undefined && { price: update.price }),
            ...(update.active !== undefined && { active: update.active }),
          },
        });
        updated++;
      } catch (error) {
        errors.push(`Failed to update gemstone ${update.gemstoneId}: ${(error as Error).message}`);
      }
    }

    return { updated, errors };
  });
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SM-${timestamp}-${random}`;
}

/**
 * Clean up expired sessions and tokens
 */
export async function cleanupExpiredData(): Promise<TransactionResult<{ cleaned: number }>> {
  return executeTransaction(async (tx) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Clean up expired password reset tokens
    const passwordResets = await tx.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Clean up old order status history (keep last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const statusHistory = await tx.orderStatusHistory.deleteMany({
      where: {
        createdAt: {
          lt: sixMonthsAgo,
        },
      },
    });

    return { cleaned: passwordResets.count + statusHistory.count };
  });
}

export { prisma };
