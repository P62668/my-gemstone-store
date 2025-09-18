// Force Prisma to prefer native library engine in local dev to avoid fetch/WASM issues
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
if (!process.env.PRISMA_FORCE_NAPI) process.env.PRISMA_FORCE_NAPI = '1';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { requireEnv } = require('../utils/env');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Prevent accidental production seeding
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== '1') {
    throw new Error('Refusing to run seeds in production. Set ALLOW_PROD_SEED=1 to override.');
  }

  // Seed categories first
  const categories = [
    { id: 1, name: 'Diamonds', description: 'The king of gemstones', image: '/images/categories/diamonds.jpg', active: true },
    { id: 2, name: 'Rubies', description: 'Precious red gemstones', image: '/images/categories/rubies.jpg', active: true },
    { id: 3, name: 'Sapphires', description: 'Royal blue gemstones', image: '/images/categories/sapphires.jpg', active: true },
    { id: 4, name: 'Emeralds', description: 'Vibrant green gemstones', image: '/images/categories/emeralds.jpg', active: true },
    { id: 5, name: 'Pearls', description: 'Elegant natural pearls', image: '/images/categories/pearls.jpg', active: true },
    { id: 6, name: 'Opals', description: 'Playful color-changing gems', image: '/images/categories/opals.jpg', active: true },
    { id: 7, name: 'Amethysts', description: 'Beautiful purple crystals', image: '/images/categories/amethysts.jpg', active: true },
    { id: 8, name: 'Topaz', description: 'Brilliant colored gemstones', image: '/images/categories/topaz.jpg', active: true },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }
  console.log('Categories seeded successfully');

  // Seed admin user if not exists
  const adminEmail = 'admin@shankarmala.com';
  let adminPassword;
  if (process.env.NODE_ENV === 'production') {
    // In production require explicit ADMIN_PASSWORD
    adminPassword = requireEnv('ADMIN_PASSWORD');
  } else {
    // Development: use provided ADMIN_PASSWORD or generate a secure temporary password
    adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      const crypto = require('crypto');
      adminPassword = crypto.randomBytes(12).toString('base64').replace(/\W/g, '').slice(0, 16);
      console.log('⚠️ No ADMIN_PASSWORD provided — generated temporary admin password for development:', adminPassword);
      console.log('Please set ADMIN_PASSWORD in your environment to use a stable password.');
    }
  }
  const hashed = await bcrypt.hash(adminPassword, 10);
  console.log('Seeding admin user with password:', adminPassword);
  console.log('Hashed password:', hashed);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashed,
    },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    },
  });
  console.log('Admin user upsert result:', admin);
  console.log('Admin user seeded:', { email: adminEmail });

  // Seed sample users
  const sampleUsers = [
    { id: 2, firstName: 'John', lastName: 'Doe', email: 'john@shankarmala.com' },
    { id: 3, firstName: 'Jane', lastName: 'Smith', email: 'jane@shankarmala.com' },
    { id: 4, firstName: 'Mike', lastName: 'Johnson', email: 'mike@shankarmala.com' },
  ];

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      },
    });
  }
  console.log('Users seeded successfully');

  // Seed gemstones with proper category mapping
  const gemstoneData = [
    {
      id: 1,
      name: 'Royal Blue Sapphire',
      description: 'Exquisite royal blue sapphire with excellent clarity and cut. Perfect for engagement rings.',
      price: 2500,
      categoryId: 3, // Sapphires
      images: JSON.stringify(['/images/gemstones/sapphire-1.jpg']),
      weight: 2.5,
      dimensions: '8x6mm',
      clarity: 'VS1',
      color: 'Royal Blue',
      cut: 'Oval',
      origin: 'Sri Lanka',
      certificate: 'GIA',
      stockCount: 5,
      featured: true,
      active: true,
    },
    {
      id: 2,
      name: 'Burmese Ruby',
      description: 'Rare Burmese ruby with pigeon blood color. Exceptional quality and rarity.',
      price: 3500,
      categoryId: 2, // Rubies
      images: JSON.stringify(['/images/gemstones/ruby-1.jpg']),
      weight: 1.8,
      dimensions: '7x5mm',
      clarity: 'VVS2',
      color: 'Pigeon Blood Red',
      cut: 'Round',
      origin: 'Myanmar',
      certificate: 'GIA',
      stockCount: 3,
      featured: true,
      active: true,
    },
    {
      id: 3,
      name: 'Colombian Emerald',
      description: 'Classic Colombian emerald with garden inclusions. Natural and untreated.',
      price: 1800,
      categoryId: 4, // Emeralds
      images: JSON.stringify(['/images/gemstones/emerald-1.jpg']),
      weight: 3.2,
      dimensions: '9x7mm',
      clarity: 'SI1',
      color: 'Deep Green',
      cut: 'Emerald Cut',
      origin: 'Colombia',
      certificate: 'GIA',
      stockCount: 8,
      featured: true,
      active: true,
    },
    {
      id: 4,
      name: 'D-Flawless Diamond',
      description: 'Rare D-color flawless diamond. The highest quality available.',
      price: 15000,
      categoryId: 1, // Diamonds
      images: JSON.stringify(['/images/gemstones/diamond-1.jpg']),
      weight: 1.5,
      dimensions: '6.5x6.5mm',
      clarity: 'FL',
      color: 'D',
      cut: 'Round Brilliant',
      origin: 'Botswana',
      certificate: 'GIA',
      stockCount: 1,
      featured: true,
      active: true,
    },
    {
      id: 5,
      name: 'South Sea Pearl',
      description: 'Luxurious South Sea pearl with golden luster. Perfect for necklaces.',
      price: 1200,
      categoryId: 5, // Pearls
      images: JSON.stringify(['/images/gemstones/pearl-1.jpg']),
      weight: 8.5,
      dimensions: '12mm',
      clarity: 'AAA',
      color: 'Golden',
      cut: 'Round',
      origin: 'Australia',
      certificate: 'GIA',
      stockCount: 12,
      featured: false,
      active: true,
    },
    {
      id: 6,
      name: 'Australian Opal',
      description: 'Stunning Australian opal with play of color. Unique and mesmerizing.',
      price: 800,
      categoryId: 6, // Opals
      images: JSON.stringify(['/images/gemstones/opal-1.jpg']),
      weight: 4.2,
      dimensions: '10x8mm',
      clarity: 'Translucent',
      color: 'Multi-color',
      cut: 'Cabochon',
      origin: 'Australia',
      certificate: 'GIA',
      stockCount: 15,
      featured: false,
      active: true,
    },
    {
      id: 7,
      name: 'Brazilian Amethyst',
      description: 'Deep purple Brazilian amethyst. Affordable luxury.',
      price: 300,
      categoryId: 7, // Amethysts
      images: JSON.stringify(['/images/gemstones/amethyst-1.jpg']),
      weight: 5.8,
      dimensions: '12x10mm',
      clarity: 'VS2',
      color: 'Deep Purple',
      cut: 'Oval',
      origin: 'Brazil',
      certificate: 'GIA',
      stockCount: 25,
      featured: false,
      active: true,
    },
    {
      id: 8,
      name: 'Imperial Topaz',
      description: 'Rare imperial topaz with golden-pink color. Highly collectible.',
      price: 2200,
      categoryId: 8, // Topaz
      images: JSON.stringify(['/images/gemstones/topaz-1.jpg']),
      weight: 2.1,
      dimensions: '8x6mm',
      clarity: 'VVS1',
      color: 'Golden Pink',
      cut: 'Oval',
      origin: 'Brazil',
      certificate: 'GIA',
      stockCount: 4,
      featured: true,
      active: true,
    },
  ];

  for (const gem of gemstoneData) {
    await prisma.gemstone.upsert({
      where: { id: gem.id },
      update: {},
      create: gem,
    });
  }
  console.log('Gemstones seeded successfully');

  // Seed default SEO if not exists
  const existingSEO = await prisma.sEO.findUnique({ where: { id: 1 } });
  if (!existingSEO) {
    await prisma.sEO.create({
      data: {
        id: 1,
        page: 'global',
        title: 'Shankarmala - Luxury Gemstone Collection',
        description: 'Discover the finest gemstones from Shankarmala heritage jewelry collection. GIA certified, worldwide shipping.',
        keywords: 'luxury gemstones, heritage jewelry, Shankarmala, precious stones, GIA certified',
        ogImage: '',
      },
    });
    console.log('Seeded default SEO');
  } else {
    console.log('SEO already exists');
  }

  console.log('Database seeding completed successfully!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
