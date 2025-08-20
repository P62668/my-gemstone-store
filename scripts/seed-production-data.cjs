#!/usr/bin/env node

/**
 * 🚀 PRODUCTION DATA SEEDING SCRIPT
 * Creates a complete e-commerce catalog with real gemstone data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Real gemstone categories
const categories = [
  { name: 'Diamonds', description: 'The king of gemstones', image: '/images/categories/diamonds.jpg' },
  { name: 'Rubies', description: 'Precious red gemstones', image: '/images/categories/rubies.jpg' },
  { name: 'Sapphires', description: 'Royal blue gemstones', image: '/images/categories/sapphires.jpg' },
  { name: 'Emeralds', description: 'Vibrant green gemstones', image: '/images/categories/emeralds.jpg' },
  { name: 'Pearls', description: 'Elegant natural pearls', image: '/images/categories/pearls.jpg' },
  { name: 'Opals', description: 'Playful color-changing gems', image: '/images/categories/opals.jpg' },
  { name: 'Amethysts', description: 'Beautiful purple crystals', image: '/images/categories/amethysts.jpg' },
  { name: 'Topaz', description: 'Brilliant colored gemstones', image: '/images/categories/topaz.jpg' }
];

// Real gemstone products
const gemstones = [
  {
    name: 'Royal Blue Sapphire',
    type: 'Sapphire',
    description: 'Exquisite royal blue sapphire with excellent clarity and cut. Perfect for engagement rings.',
    price: 2500.00,
    stockCount: 5,
    images: ['/images/gemstones/sapphire-1.jpg'],
    weight: 2.5,
    dimensions: '8x6mm',
    clarity: 'VS1',
    color: 'Royal Blue',
    cut: 'Oval',
    origin: 'Sri Lanka',
    certificate: 'GIA',
    featured: true,
    active: true,
    categoryName: 'Sapphires'
  },
  {
    name: 'Burmese Ruby',
    type: 'Ruby',
    description: 'Rare Burmese ruby with pigeon blood color. Exceptional quality and rarity.',
    price: 3500.00,
    stockCount: 3,
    images: ['/images/gemstones/ruby-1.jpg', ''],
    weight: 1.8,
    dimensions: '7x5mm',
    clarity: 'VVS2',
    color: 'Pigeon Blood Red',
    cut: 'Round',
    origin: 'Myanmar',
    certificate: 'GIA',
    featured: true,
    active: true,
    categoryName: 'Rubies'
  },
  {
    name: 'Colombian Emerald',
    type: 'Emerald',
    description: 'Classic Colombian emerald with garden inclusions. Natural and untreated.',
    price: 1800.00,
    stockCount: 8,
    images: ['/images/gemstones/emerald-1.jpg', ''],
    weight: 3.2,
    dimensions: '9x7mm',
    clarity: 'SI1',
    color: 'Deep Green',
    cut: 'Emerald Cut',
    origin: 'Colombia',
    certificate: 'GIA',
    featured: true,
    active: true,
    categoryName: 'Emeralds'
  },
  {
    name: 'D-Flawless Diamond',
    type: 'Diamond',
    description: 'Rare D-color flawless diamond. The highest quality available.',
    price: 15000.00,
    stockCount: 1,
    images: ['/images/gemstones/diamond-1.jpg', ''],
    weight: 1.5,
    dimensions: '6.5x6.5mm',
    clarity: 'FL',
    color: 'D',
    cut: 'Round Brilliant',
    origin: 'Botswana',
    certificate: 'GIA',
    featured: true,
    active: true,
    categoryName: 'Diamonds'
  },
  {
    name: 'South Sea Pearl',
    type: 'Pearl',
    description: 'Luxurious South Sea pearl with golden luster. Perfect for necklaces.',
    price: 1200.00,
    stockCount: 12,
    images: ['/images/gemstones/pearl-1.jpg', ''],
    weight: 8.5,
    dimensions: '12mm',
    clarity: 'AAA',
    color: 'Golden',
    cut: 'Round',
    origin: 'Australia',
    certificate: 'GIA',
    featured: false,
    active: true,
    categoryName: 'Pearls'
  },
  {
    name: 'Australian Opal',
    type: 'Opal',
    description: 'Stunning Australian opal with play of color. Unique and mesmerizing.',
    price: 800.00,
    stockCount: 15,
    images: ['/images/gemstones/opal-1.jpg', ''],
    weight: 4.2,
    dimensions: '10x8mm',
    clarity: 'Translucent',
    color: 'Multi-color',
    cut: 'Cabochon',
    origin: 'Australia',
    certificate: 'GIA',
    featured: false,
    active: true,
    categoryName: 'Opals'
  },
  {
    name: 'Brazilian Amethyst',
    type: 'Amethyst',
    description: 'Deep purple Brazilian amethyst. Affordable luxury.',
    price: 300.00,
    stockCount: 25,
    images: ['/images/gemstones/amethyst-1.jpg', ''],
    weight: 5.8,
    dimensions: '12x10mm',
    clarity: 'VS2',
    color: 'Deep Purple',
    cut: 'Oval',
    origin: 'Brazil',
    certificate: 'GIA',
    featured: false,
    active: true,
    categoryName: 'Amethysts'
  },
  {
    name: 'Imperial Topaz',
    type: 'Topaz',
    description: 'Rare imperial topaz with golden-pink color. Highly collectible.',
    price: 2200.00,
    stockCount: 4,
    images: ['/images/gemstones/topaz-1.jpg', ''],
    weight: 2.1,
    dimensions: '8x6mm',
    clarity: 'VVS1',
    color: 'Golden Pink',
    cut: 'Oval',
    origin: 'Brazil',
    certificate: 'GIA',
    featured: true,
    active: true,
    categoryName: 'Topaz'
  }
];

// Sample users
const users = [
  {
    email: 'customer@example.com',
    password: 'Customer123!',
    firstName: 'John',
    lastName: 'Customer',
    role: 'user',
    active: true
  },
  {
    email: 'vip@example.com',
    password: 'VIP123!',
    firstName: 'Sarah',
    lastName: 'VIP',
    role: 'user',
    active: true
  }
];

async function seedDatabase() {
  console.log('🚀 Starting production data seeding...');
  
  try {
    // 1. Create categories
    console.log('📂 Creating categories...');
    const createdCategories = {};
    
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
          description: category.description,
          image: category.image,
          active: true
        }
      });
      createdCategories[category.name] = created;
      console.log(`✅ Created category: ${category.name}`);
    }

    // 2. Create gemstones
    console.log('💎 Creating gemstones...');
    for (const gemstone of gemstones) {
      const category = createdCategories[gemstone.categoryName];
      if (!category) {
        console.log(`⚠️ Category not found: ${gemstone.categoryName}`);
        continue;
      }

      await prisma.gemstone.create({
        data: {
          name: gemstone.name,
          description: gemstone.description,
          price: gemstone.price,
          stockCount: gemstone.stockCount,
          images: JSON.stringify(gemstone.images),
          weight: gemstone.weight,
          dimensions: gemstone.dimensions,
          clarity: gemstone.clarity,
          color: gemstone.color,
          cut: gemstone.cut,
          origin: gemstone.origin,
          certificate: gemstone.certificate,
          featured: gemstone.featured,
          active: gemstone.active,
          categoryId: category.id,
          lowStockThreshold: 5
        }
      });
      console.log(`✅ Created gemstone: ${gemstone.name}`);
    }

    // 3. Create sample users
    console.log('👥 Creating sample users...');
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          active: user.active
        }
      });
      console.log(`✅ Created user: ${user.email}`);
    }

    // 4. Create sample orders
    console.log('📦 Creating sample orders...');
    const sampleGemstones = await prisma.gemstone.findMany({ take: 3 });
    const sampleUser = await prisma.user.findFirst({ where: { role: 'user' } });
    
    if (sampleGemstones.length > 0 && sampleUser) {
      const order = await prisma.order.create({
        data: {
          userId: sampleUser.id,
          orderNumber: `SM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'completed',
          total: sampleGemstones.reduce((sum, gem) => sum + gem.price, 0),
          shippingAddress: JSON.stringify({
            firstName: sampleUser.firstName,
            lastName: sampleUser.lastName,
            address1: '123 Main Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            phone: '+1-555-0123'
          }),
          items: {
            create: sampleGemstones.map((gem, index) => ({
              gemstoneId: gem.id,
              quantity: index + 1,
              price: gem.price
            }))
          }
        }
      });
      console.log(`✅ Created sample order: ${order.orderNumber}`);
    }

    // 5. Create homepage sections
    console.log('🏠 Creating homepage sections...');
    const homepageSections = [
      {
        key: 'hero',
        content: {
          title: 'Luxury Gemstones',
          subtitle: 'Discover the world\'s finest collection',
          ctaText: 'Shop Now',
          ctaLink: '/shop',
          backgroundImage: '/images/hero-bg.jpg'
        },
        order: 1,
        active: true
      },
      {
        key: 'featured_products',
        content: {
          title: 'Featured Gemstones',
          subtitle: 'Handpicked for you',
          products: sampleGemstones.map(gem => ({
            id: gem.id,
            name: gem.name,
            price: gem.price,
            image: gem.images[0]
          }))
        },
        order: 2,
        active: true
      }
    ];

    for (const section of homepageSections) {
      await prisma.homepageSection.upsert({
        where: { key: section.key },
        update: { content: section.content },
        create: {
          key: section.key,
          content: section.content,
          order: section.order,
          active: section.active
        }
      });
      console.log(`✅ Created homepage section: ${section.key}`);
    }

    console.log('\n🎉 Production data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Gemstones: ${gemstones.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Sample Orders: 1`);
    console.log(`   Homepage Sections: ${homepageSections.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🚀 Database is now ready for production!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
