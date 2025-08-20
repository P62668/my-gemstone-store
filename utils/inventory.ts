import { prisma } from '../lib/prisma';
import { emailService } from './email';

export interface InventoryAlert {
  gemstoneId: number;
  gemstoneName: string;
  currentStock: number;
  threshold: number;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
}

export class InventoryManager {
  /**
   * Update stock count for a gemstone
   */
  static async updateStock(gemstoneId: number, quantity: number, operation: 'add' | 'subtract'): Promise<boolean> {
    try {
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
        select: { id: true, name: true, stockCount: true, lowStockThreshold: true },
      });

      if (!gemstone) {
        throw new Error(`Gemstone with ID ${gemstoneId} not found`);
      }

      const newStockCount = operation === 'add' 
        ? gemstone.stockCount + quantity 
        : Math.max(0, gemstone.stockCount - quantity);

      await prisma.gemstone.update({
        where: { id: gemstoneId },
        data: { stockCount: newStockCount },
      });

      // Check for inventory alerts
      await this.checkInventoryAlerts(gemstoneId);

      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  }

  /**
   * Check if gemstone is in stock
   */
  static async isInStock(gemstoneId: number, quantity: number = 1): Promise<boolean> {
    try {
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
        select: { stockCount: true, active: true },
      });

      return Boolean(gemstone?.active && gemstone.stockCount >= quantity);
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  }

  /**
   * Get current stock level
   */
  static async getStockLevel(gemstoneId: number): Promise<number> {
    try {
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
        select: { stockCount: true },
      });

      return gemstone?.stockCount || 0;
    } catch (error) {
      console.error('Error getting stock level:', error);
      return 0;
    }
  }

  /**
   * Check for inventory alerts
   */
  static async checkInventoryAlerts(gemstoneId: number): Promise<void> {
    try {
      const gemstone = await prisma.gemstone.findUnique({
        where: { id: gemstoneId },
        select: { 
          id: true, 
          name: true, 
          stockCount: true, 
          lowStockThreshold: true,
          active: true 
        },
      });

      if (!gemstone || !gemstone.active) return;

      const alerts: InventoryAlert[] = [];

      // Check for out of stock
      if (gemstone.stockCount === 0) {
        alerts.push({
          gemstoneId: gemstone.id,
          gemstoneName: gemstone.name,
          currentStock: gemstone.stockCount,
          threshold: gemstone.lowStockThreshold,
          type: 'out_of_stock',
        });
      }
      // Check for low stock
      else if (gemstone.stockCount <= gemstone.lowStockThreshold) {
        alerts.push({
          gemstoneId: gemstone.id,
          gemstoneName: gemstone.name,
          currentStock: gemstone.stockCount,
          threshold: gemstone.lowStockThreshold,
          type: 'low_stock',
        });
      }

      // Send alerts if any
      if (alerts.length > 0) {
        await this.sendInventoryAlerts(alerts);
      }
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
    }
  }

  /**
   * Send inventory alerts to admin
   */
  static async sendInventoryAlerts(alerts: InventoryAlert[]): Promise<void> {
    try {
      // Get admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, name: true },
      });

      if (adminUsers.length === 0) return;

      // Send email to all admin users
      for (const admin of adminUsers) {
        await emailService.sendEmail({
          to: admin.email,
          subject: 'Inventory Alert - Shankarmala',
          html: this.generateInventoryAlertHTML(alerts),
          text: this.generateInventoryAlertText(alerts),
        });
      }

      console.log(`Inventory alerts sent to ${adminUsers.length} admin users`);
    } catch (error) {
      console.error('Error sending inventory alerts:', error);
    }
  }

  /**
   * Get all low stock items
   */
  static async getLowStockItems(): Promise<any[]> {
    try {
      return await prisma.gemstone.findMany({
        where: {
          active: true,
          stockCount: {
            lte: prisma.gemstone.fields.lowStockThreshold,
          },
        },
        select: {
          id: true,
          name: true,
          stockCount: true,
          lowStockThreshold: true,
          price: true,
        },
        orderBy: { stockCount: 'asc' },
      });
    } catch (error) {
      console.error('Error getting low stock items:', error);
      return [];
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(): Promise<{
    totalItems: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  }> {
    try {
      const gemstones = await prisma.gemstone.findMany({
        where: { active: true },
        select: { stockCount: true, lowStockThreshold: true, price: true },
      });

      const stats = {
        totalItems: gemstones.length,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
      };

      gemstones.forEach(gemstone => {
        const value = gemstone.stockCount * gemstone.price;
        stats.totalValue += value;

        if (gemstone.stockCount === 0) {
          stats.outOfStock++;
        } else if (gemstone.stockCount <= gemstone.lowStockThreshold) {
          stats.lowStock++;
        } else {
          stats.inStock++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalItems: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
      };
    }
  }

  /**
   * Bulk update stock levels
   */
  static async bulkUpdateStock(updates: Array<{ gemstoneId: number; quantity: number; operation: 'add' | 'subtract' }>): Promise<boolean> {
    try {
      for (const update of updates) {
        await this.updateStock(update.gemstoneId, update.quantity, update.operation);
      }
      return true;
    } catch (error) {
      console.error('Error in bulk stock update:', error);
      return false;
    }
  }

  /**
   * Set low stock threshold for a gemstone
   */
  static async setLowStockThreshold(gemstoneId: number, threshold: number): Promise<boolean> {
    try {
      await prisma.gemstone.update({
        where: { id: gemstoneId },
        data: { lowStockThreshold: threshold },
      });
      return true;
    } catch (error) {
      console.error('Error setting low stock threshold:', error);
      return false;
    }
  }

  private static generateInventoryAlertHTML(alerts: InventoryAlert[]): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Inventory Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-item { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ef4444; }
            .out-of-stock { border-left-color: #dc2626; }
            .low-stock { border-left-color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Inventory Alert</h1>
              <p>${alerts.length} item${alerts.length > 1 ? 's' : ''} require attention</p>
            </div>
            <div class="content">
              <h2>Inventory Status</h2>
              ${alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                  <h3>${alert.gemstoneName}</h3>
                  <p><strong>Current Stock:</strong> ${alert.currentStock}</p>
                  <p><strong>Threshold:</strong> ${alert.threshold}</p>
                  <p><strong>Status:</strong> ${alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}</p>
                </div>
              `).join('')}
              
              <p>Please review and update inventory levels as needed.</p>
              
              <p>Best regards,<br>Shankarmala Inventory System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateInventoryAlertText(alerts: InventoryAlert[]): string {
    return `
Inventory Alert - Shankarmala

${alerts.length} item${alerts.length > 1 ? 's' : ''} require attention:

${alerts.map(alert => `
${alert.gemstoneName}
- Current Stock: ${alert.currentStock}
- Threshold: ${alert.threshold}
- Status: ${alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
`).join('\n')}

Please review and update inventory levels as needed.

Best regards,
Shankarmala Inventory System
    `;
  }
}
