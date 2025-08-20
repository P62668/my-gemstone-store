import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Clean up duplicate gemstones
    console.log('Cleaning up duplicate gemstones...');
    
    // Get all gemstones grouped by name
    const gemstones = await prisma.gemstone.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const gemstoneGroups = {};
    gemstones.forEach(gemstone => {
      if (!gemstoneGroups[gemstone.name]) {
        gemstoneGroups[gemstone.name] = [];
      }
      gemstoneGroups[gemstone.name].push(gemstone);
    });

    // Keep only the first occurrence of each gemstone name
    for (const [name, duplicates] of Object.entries(gemstoneGroups)) {
      if (duplicates.length > 1) {
        console.log(`Found ${duplicates.length} duplicates for "${name}"`);
        
        // Keep the first one, delete the rest
        const toDelete = duplicates.slice(1);
        for (const duplicate of toDelete) {
          await prisma.gemstone.delete({
            where: { id: duplicate.id }
          });
          console.log(`Deleted duplicate gemstone ID: ${duplicate.id}`);
        }
      }
    }

    // Clean up any orphaned records
    console.log('Cleaning up orphaned records...');
    
    // Delete cart items for non-existent gemstones
    const cartItems = await prisma.cartItem.findMany({
      include: { gemstone: true }
    });
    
    for (const item of cartItems) {
      if (!item.gemstone) {
        await prisma.cartItem.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned cart item ID: ${item.id}`);
      }
    }

    // Delete wishlist items for non-existent gemstones
    const wishlistItems = await prisma.wishlistItem.findMany({
      include: { gemstone: true }
    });
    
    for (const item of wishlistItems) {
      if (!item.gemstone) {
        await prisma.wishlistItem.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned wishlist item ID: ${item.id}`);
      }
    }

    // Delete order items for non-existent gemstones
    const orderItems = await prisma.orderItem.findMany({
      include: { gemstone: true }
    });
    
    for (const item of orderItems) {
      if (!item.gemstone) {
        await prisma.orderItem.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned order item ID: ${item.id}`);
      }
    }

    // Delete recently viewed for non-existent gemstones
    const recentlyViewed = await prisma.recentlyViewed.findMany({
      include: { gemstone: true }
    });
    
    for (const item of recentlyViewed) {
      if (!item.gemstone) {
        await prisma.recentlyViewed.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned recently viewed ID: ${item.id}`);
      }
    }

    // Delete reviews for non-existent gemstones
    const reviews = await prisma.review.findMany({
      include: { gemstone: true }
    });
    
    for (const review of reviews) {
      if (!review.gemstone) {
        await prisma.review.delete({
          where: { id: review.id }
        });
        console.log(`Deleted orphaned review ID: ${review.id}`);
      }
    }

    // Delete inventory for non-existent gemstones
    const inventory = await prisma.inventory.findMany({
      include: { gemstone: true }
    });
    
    for (const item of inventory) {
      if (!item.gemstone) {
        await prisma.inventory.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned inventory item ID: ${item.id}`);
      }
    }

    // Clean up empty orders
    const orders = await prisma.order.findMany({
      include: { items: true }
    });
    
    for (const order of orders) {
      if (order.items.length === 0) {
        await prisma.order.delete({
          where: { id: order.id }
        });
        console.log(`Deleted empty order ID: ${order.id}`);
      }
    }

    // Clean up empty carts
    const carts = await prisma.cartItem.findMany({
      include: { user: true }
    });
    
    for (const item of carts) {
      if (!item.user) {
        await prisma.cartItem.delete({
          where: { id: item.id }
        });
        console.log(`Deleted orphaned cart item ID: ${item.id}`);
      }
    }

    console.log('✅ Database cleanup completed successfully!');
    
    // Show final counts
    const finalCounts = await Promise.all([
      prisma.gemstone.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.cartItem.count(),
      prisma.wishlistItem.count(),
    ]);
    
    console.log('\n📊 Final Database Counts:');
    console.log(`Gemstones: ${finalCounts[0]}`);
    console.log(`Categories: ${finalCounts[1]}`);
    console.log(`Users: ${finalCounts[2]}`);
    console.log(`Orders: ${finalCounts[3]}`);
    console.log(`Cart Items: ${finalCounts[4]}`);
    console.log(`Wishlist Items: ${finalCounts[5]}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupDatabase()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
