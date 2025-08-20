import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
  };
}

export class DatabaseValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private totalRecords = 0;
  private validRecords = 0;

  async validateAll(): Promise<ValidationResult> {
    this.errors = [];
    this.warnings = [];
    this.totalRecords = 0;
    this.validRecords = 0;

    try {
      await this.validateUsers();
      await this.validateCategories();
      await this.validateGemstones();
      await this.validateOrders();
      await this.validateCartItems();
      await this.validateWishlistItems();
      await this.validateReviews();
      await this.validateAddresses();
      await this.validateInventory();
      await this.validateCMSData();
      await this.validateRelationships();
      await this.validateConstraints();

      return {
        isValid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        summary: {
          totalRecords: this.totalRecords,
          validRecords: this.validRecords,
          invalidRecords: this.totalRecords - this.validRecords,
        },
      };
    } catch (error) {
      logger.error('Database validation failed', undefined, error as Error);
      this.errors.push(`Validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        isValid: false,
        errors: this.errors,
        warnings: this.warnings,
        summary: {
          totalRecords: this.totalRecords,
          validRecords: this.validRecords,
          invalidRecords: this.totalRecords - this.validRecords,
        },
      };
    }
  }

  private async validateUsers(): Promise<void> {
    const users = await prisma.user.findMany();
    this.totalRecords += users.length;

    for (const user of users) {
      let isValid = true;

      // Check required fields
      if (!user.email || !user.password) {
        this.errors.push(`User ${user.id}: Missing required fields (email or password)`);
        isValid = false;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        this.errors.push(`User ${user.id}: Invalid email format: ${user.email}`);
        isValid = false;
      }

      // Check password length
      if (user.password.length < 6) {
        this.errors.push(`User ${user.id}: Password too short (minimum 6 characters)`);
        isValid = false;
      }

      // Check role validity
      if (!['user', 'admin'].includes(user.role)) {
        this.errors.push(`User ${user.id}: Invalid role: ${user.role}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateCategories(): Promise<void> {
    const categories = await prisma.category.findMany();
    this.totalRecords += categories.length;

    for (const category of categories) {
      let isValid = true;

      if (!category.name) {
        this.errors.push(`Category ${category.id}: Missing name`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateGemstones(): Promise<void> {
    const gemstones = await prisma.gemstone.findMany({
      include: { category: true },
    });
    this.totalRecords += gemstones.length;

    for (const gemstone of gemstones) {
      let isValid = true;

      // Check required fields
      if (!gemstone.name || !gemstone.description || gemstone.price <= 0) {
        this.errors.push(`Gemstone ${gemstone.id}: Missing required fields or invalid price`);
        isValid = false;
      }

      // Check category relationship
      if (!gemstone.category) {
        this.errors.push(`Gemstone ${gemstone.id}: Missing category relationship`);
        isValid = false;
      }

      // Check stock count
      if (gemstone.stockCount < 0) {
        this.errors.push(`Gemstone ${gemstone.id}: Negative stock count: ${gemstone.stockCount}`);
        isValid = false;
      }

      // Check price consistency
      if (gemstone.salePrice && gemstone.salePrice >= gemstone.price) {
        this.errors.push(`Gemstone ${gemstone.id}: Sale price must be less than regular price`);
        isValid = false;
      }

      // Validate images JSON
      try {
        const images = JSON.parse(gemstone.images);
        if (!Array.isArray(images)) {
          this.errors.push(`Gemstone ${gemstone.id}: Images must be an array`);
          isValid = false;
        }
      } catch {
        this.errors.push(`Gemstone ${gemstone.id}: Invalid images JSON format`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateOrders(): Promise<void> {
    const orders = await prisma.order.findMany({
      include: { user: true, items: true },
    });
    this.totalRecords += orders.length;

    for (const order of orders) {
      let isValid = true;

      // Check required fields
      if (!order.user) {
        this.errors.push(`Order ${order.id}: Missing user relationship`);
        isValid = false;
      }

      if (order.total <= 0) {
        this.errors.push(`Order ${order.id}: Invalid total amount: ${order.total}`);
        isValid = false;
      }

      // Check status validity
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(order.status)) {
        this.errors.push(`Order ${order.id}: Invalid status: ${order.status}`);
        isValid = false;
      }

      // Check payment status validity
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(order.paymentStatus)) {
        this.errors.push(`Order ${order.id}: Invalid payment status: ${order.paymentStatus}`);
        isValid = false;
      }

      // Validate shipping address JSON
      try {
        JSON.parse(order.shippingAddress);
      } catch {
        this.errors.push(`Order ${order.id}: Invalid shipping address JSON format`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateCartItems(): Promise<void> {
    const cartItems = await prisma.cartItem.findMany({
      include: { user: true, gemstone: true },
    });
    this.totalRecords += cartItems.length;

    for (const item of cartItems) {
      let isValid = true;

      if (!item.user) {
        this.errors.push(`CartItem ${item.id}: Missing user relationship`);
        isValid = false;
      }

      if (!item.gemstone) {
        this.errors.push(`CartItem ${item.id}: Missing gemstone relationship`);
        isValid = false;
      }

      if (item.quantity <= 0) {
        this.errors.push(`CartItem ${item.id}: Invalid quantity: ${item.quantity}`);
        isValid = false;
      }

      if (item.price <= 0) {
        this.errors.push(`CartItem ${item.id}: Invalid price: ${item.price}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateWishlistItems(): Promise<void> {
    const wishlistItems = await prisma.wishlistItem.findMany({
      include: { user: true, gemstone: true },
    });
    this.totalRecords += wishlistItems.length;

    for (const item of wishlistItems) {
      let isValid = true;

      if (!item.user) {
        this.errors.push(`WishlistItem ${item.id}: Missing user relationship`);
        isValid = false;
      }

      if (!item.gemstone) {
        this.errors.push(`WishlistItem ${item.id}: Missing gemstone relationship`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateReviews(): Promise<void> {
    const reviews = await prisma.review.findMany({
      include: { user: true, gemstone: true },
    });
    this.totalRecords += reviews.length;

    for (const review of reviews) {
      let isValid = true;

      if (!review.user) {
        this.errors.push(`Review ${review.id}: Missing user relationship`);
        isValid = false;
      }

      if (!review.gemstone) {
        this.errors.push(`Review ${review.id}: Missing gemstone relationship`);
        isValid = false;
      }

      if (review.rating < 1 || review.rating > 5) {
        this.errors.push(`Review ${review.id}: Invalid rating: ${review.rating}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateAddresses(): Promise<void> {
    const addresses = await prisma.address.findMany({
      include: { user: true },
    });
    this.totalRecords += addresses.length;

    for (const address of addresses) {
      let isValid = true;

      if (!address.user) {
        this.errors.push(`Address ${address.id}: Missing user relationship`);
        isValid = false;
      }

      if (!address.firstName || !address.lastName || !address.address1 || !address.city || !address.state || !address.postalCode || !address.country) {
        this.errors.push(`Address ${address.id}: Missing required fields`);
        isValid = false;
      }

      if (!['billing', 'shipping'].includes(address.type)) {
        this.errors.push(`Address ${address.id}: Invalid type: ${address.type}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateInventory(): Promise<void> {
    const inventory = await prisma.inventory.findMany({
      include: { gemstone: true },
    });
    this.totalRecords += inventory.length;

    for (const item of inventory) {
      let isValid = true;

      if (!item.gemstone) {
        this.errors.push(`Inventory ${item.id}: Missing gemstone relationship`);
        isValid = false;
      }

      if (item.quantity < 0) {
        this.errors.push(`Inventory ${item.id}: Negative quantity: ${item.quantity}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateCMSData(): Promise<void> {
    // Validate HomepageSection
    const homepageSections = await prisma.homepageSection.findMany();
    this.totalRecords += homepageSections.length;

    for (const section of homepageSections) {
      let isValid = true;

      if (!section.key) {
        this.errors.push(`HomepageSection ${section.id}: Missing key`);
        isValid = false;
      }

      try {
        JSON.parse(JSON.stringify(section.content));
      } catch {
        this.errors.push(`HomepageSection ${section.id}: Invalid content JSON`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }

    // Validate FAQ
    const faqs = await prisma.fAQ.findMany();
    this.totalRecords += faqs.length;

    for (const faq of faqs) {
      let isValid = true;

      if (!faq.question || !faq.answer) {
        this.errors.push(`FAQ ${faq.id}: Missing question or answer`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }

    // Validate Testimonial
    const testimonials = await prisma.testimonial.findMany();
    this.totalRecords += testimonials.length;

    for (const testimonial of testimonials) {
      let isValid = true;

      if (!testimonial.name || !testimonial.content) {
        this.errors.push(`Testimonial ${testimonial.id}: Missing name or content`);
        isValid = false;
      }

      if (testimonial.rating < 1 || testimonial.rating > 5) {
        this.errors.push(`Testimonial ${testimonial.id}: Invalid rating: ${testimonial.rating}`);
        isValid = false;
      }

      if (isValid) this.validRecords++;
    }
  }

  private async validateRelationships(): Promise<void> {
    // Check for orphaned records
    const orphanedCartItems = await prisma.cartItem.findMany({
      where: {
        OR: [
          { user: { id: 0 } },
          { gemstone: { id: 0 } },
        ],
      },
    });

    if (orphanedCartItems.length > 0) {
      this.errors.push(`Found ${orphanedCartItems.length} orphaned cart items`);
    }

    const orphanedWishlistItems = await prisma.wishlistItem.findMany({
      where: {
        OR: [
          { user: { id: 0 } },
          { gemstone: { id: 0 } },
        ],
      },
    });

    if (orphanedWishlistItems.length > 0) {
      this.errors.push(`Found ${orphanedWishlistItems.length} orphaned wishlist items`);
    }

    const orphanedReviews = await prisma.review.findMany({
      where: {
        OR: [
          { user: { id: 0 } },
          { gemstone: { id: 0 } },
        ],
      },
    });

    if (orphanedReviews.length > 0) {
      this.errors.push(`Found ${orphanedReviews.length} orphaned reviews`);
    }
  }

  private async validateConstraints(): Promise<void> {
    // Check for duplicate emails
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateEmails) && duplicateEmails.length > 0) {
      this.errors.push(`Found ${duplicateEmails.length} duplicate email addresses`);
    }

    // Check for duplicate category names
    const duplicateCategories = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM categories
      GROUP BY name
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateCategories) && duplicateCategories.length > 0) {
      this.errors.push(`Found ${duplicateCategories.length} duplicate category names`);
    }
  }

  async fixCommonIssues(): Promise<void> {
    logger.info('Starting database repair...');

    try {
      // Fix negative stock counts
      await prisma.gemstone.updateMany({
        where: { stockCount: { lt: 0 } },
        data: { stockCount: 0 },
      });

      // Fix invalid ratings
      await prisma.review.updateMany({
        where: { rating: { lt: 1 } },
        data: { rating: 1 },
      });

      await prisma.review.updateMany({
        where: { rating: { gt: 5 } },
        data: { rating: 5 },
      });

      // Fix invalid order totals
      await prisma.order.updateMany({
        where: { total: { lte: 0 } },
        data: { total: 0.01 },
      });

      // Remove orphaned cart items
      await prisma.cartItem.deleteMany({
        where: {
          OR: [
            { user: { id: 0 } },
            { gemstone: { id: 0 } },
          ],
        },
      });

      // Remove orphaned wishlist items
      await prisma.wishlistItem.deleteMany({
        where: {
          OR: [
            { user: { id: 0 } },
            { gemstone: { id: 0 } },
          ],
        },
      });

      logger.info('Database repair completed');
    } catch (error) {
      logger.error('Database repair failed', undefined, error as Error);
      throw error;
    }
  }
}

export async function validateDatabase(): Promise<ValidationResult> {
  const validator = new DatabaseValidator();
  return await validator.validateAll();
}

export async function repairDatabase(): Promise<void> {
  const validator = new DatabaseValidator();
  await validator.fixCommonIssues();
}
