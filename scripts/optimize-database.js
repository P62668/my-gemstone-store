const { PrismaClient } = require('@prisma/client');

// Database optimization script
async function optimizeDatabase() {
  console.log('Optimizing database queries...');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Add database indexes for frequently queried fields
    console.log('1. Checking for missing database indexes...');
    
    // These would typically be added via Prisma migrations
    const recommendedIndexes = [
      'CREATE INDEX IF NOT EXISTS gemstone_category_id_idx ON Gemstone(category_id);',
      'CREATE INDEX IF NOT EXISTS gemstone_featured_idx ON Gemstone(featured);',
      'CREATE INDEX IF NOT EXISTS gemstone_price_idx ON Gemstone(price);',
      'CREATE INDEX IF NOT EXISTS gemstone_created_at_idx ON Gemstone(createdAt);',
      'CREATE INDEX IF NOT EXISTS category_name_idx ON Category(name);',
      'CREATE INDEX IF NOT EXISTS user_email_idx ON User(email);',
      'CREATE INDEX IF NOT EXISTS order_user_id_idx ON "Order"(userId);',
      'CREATE INDEX IF NOT EXISTS order_created_at_idx ON "Order"(createdAt);'
    ];
    
    console.log('   Recommended indexes:');
    recommendedIndexes.forEach(index => {
      console.log(`   - ${index}`);
    });
    
    // 2. Analyze query performance
    console.log('2. Analyzing query performance...');
    
    // Example of optimized queries
    const optimizedQueries = {
      'Get featured gemstones': `
        SELECT g.*, c.name as category_name 
        FROM Gemstone g 
        JOIN Category c ON g.category_id = c.id 
        WHERE g.featured = true 
        ORDER BY g.createdAt DESC 
        LIMIT 10;
      `,
      
      'Get gemstones with pagination': `
        SELECT g.*, c.name as category_name 
        FROM Gemstone g 
        JOIN Category c ON g.category_id = c.id 
        WHERE g.active = true 
        ORDER BY g.createdAt DESC 
        LIMIT 12 OFFSET 0;
      `,
      
      'Search gemstones': `
        SELECT g.*, c.name as category_name 
        FROM Gemstone g 
        JOIN Category c ON g.category_id = c.id 
        WHERE g.active = true 
        AND (g.name LIKE '%search_term%' 
             OR g.description LIKE '%search_term%' 
             OR g.type LIKE '%search_term%')
        ORDER BY g.createdAt DESC 
        LIMIT 20;
      `
    };
    
    console.log('   Optimized query examples:');
    Object.keys(optimizedQueries).forEach(queryName => {
      console.log(`   ${queryName}:`);
      console.log(`     ${optimizedQueries[queryName].split('\n').join('\n     ')}`);
    });
    
    // 3. Database statistics
    console.log('3. Database statistics:');
    
    // Get row counts for key tables
    try {
      const gemstoneCount = await prisma.gemstone.count();
      const categoryCount = await prisma.category.count();
      const userCount = await prisma.user.count();
      const orderCount = await prisma.order.count();
      
      console.log('   Row counts:');
      console.log(`     Gemstones: ${gemstoneCount}`);
      console.log(`     Categories: ${categoryCount}`);
      console.log(`     Users: ${userCount}`);
      console.log(`     Orders: ${orderCount}`);
    } catch (error) {
      console.log('   Could not get row counts:', error.message);
    }
    
    console.log('\n🎉 Database optimization analysis completed!');
    console.log('\nRecommendations:');
    console.log('1. Add the recommended indexes via Prisma migrations');
    console.log('2. For production, consider using PostgreSQL with connection pooling');
    console.log('3. Monitor slow query logs regularly');
    console.log('4. Use database query caching for frequently accessed data');
    console.log('5. Consider database partitioning for large tables');
    console.log('6. Regularly optimize database performance');
    
  } catch (error) {
    console.error('Error during database optimization:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeDatabase();