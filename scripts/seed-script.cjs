const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Categories
  const rubyCat = await prisma.category.create({
    data: { name: 'Ruby', description: 'Finest rubies from Burma', active: true },
  });
  const emeraldCat = await prisma.category.create({
    data: {
      name: 'Emerald',
      description: 'Colombian emeralds of the highest clarity',
      active: true,
    },
  });
  const sapphireCat = await prisma.category.create({
    data: { name: 'Sapphire', description: 'Royal blue sapphires from Kashmir', active: true },
  });
  const diamondCat = await prisma.category.create({
    data: { name: 'Diamond', description: 'Dazzling diamonds, GIA certified', active: true },
  });

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kolkata-gems.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@kolkata-gems.com',
      password: adminPassword,
    },
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@kolkata-gems.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@kolkata-gems.com',
      password: userPassword,
    },
  });

  // Gemstones
  const ruby = await prisma.gemstone.create({
    data: {
      name: 'Burma Ruby',
      type: 'Ruby',
      description: 'A rare, vivid red ruby from Burma.',
      price: 25000,
      images: JSON.stringify(['/images/ruby1.jpg', '/images/ruby2.jpg']),
      certification: 'GIA',
      categoryId: rubyCat.id,
    },
  });
  const emerald = await prisma.gemstone.create({
    data: {
      name: 'Colombian Emerald',
      type: 'Emerald',
      description: 'A lush green emerald from Colombia.',
      price: 18000,
      images: JSON.stringify(['/images/emerald1.jpg']),
      certification: 'IGI',
      categoryId: emeraldCat.id,
    },
  });
  const sapphire = await prisma.gemstone.create({
    data: {
      name: 'Kashmir Sapphire',
      type: 'Sapphire',
      description: 'A royal blue sapphire from Kashmir.',
      price: 30000,
      images: JSON.stringify(['/images/sapphire1.jpg']),
      certification: 'GIA',
      categoryId: sapphireCat.id,
    },
  });

  // Orders
  await prisma.order.create({
    data: {
      userId: user.id,
      total: 25000,
      status: 'paid',
      items: {
        create: [{ gemstoneId: ruby.id, quantity: 1, price: 25000 }],
      },
    },
  });
  await prisma.order.create({
    data: {
      userId: user.id,
      total: 18000,
      status: 'pending',
      items: {
        create: [{ gemstoneId: emerald.id, quantity: 1, price: 18000 }],
      },
    },
  });

  // Banners
  await prisma.banner.create({
    data: {
      title: 'Heritage Jewels',
      subtitle: 'Discover timeless luxury',
      image: '/images/hero-gemstones.jpg',
      link: '/shop',
      order: 1,
      active: true,
    },
  });

  // Testimonials
  await prisma.testimonial.create({
    data: {
      name: 'S. Roy',
      quote: 'The finest gemstones I have ever seen. Service was impeccable!',
      image: '/images/testimonial1.jpg',
      order: 1,
      active: true,
    },
  });

  // Press
  await prisma.press.create({
    data: {
      title: 'Featured in Vogue',
      logo: '/images/press1.jpg',
      link: 'https://vogue.in',
      order: 1,
      active: true,
    },
  });

  // FAQs
  await prisma.fAQ.create({
    data: {
      question: 'Are your gemstones certified?',
      answer: 'Yes, all our gemstones come with international certification.',
      order: 1,
      active: true,
    },
  });

  // Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      about: 'Kolkata Gems is a heritage jeweler in Kolkata.',
      contact: 'info@kolkata-gems.com',
      address: 'Park Street, Kolkata',
      phone: '+91-33-1234-5678',
      email: 'info@kolkata-gems.com',
    },
    create: {
      id: 1,
      about: 'Kolkata Gems is a heritage jeweler in Kolkata.',
      contact: 'info@kolkata-gems.com',
      address: 'Park Street, Kolkata',
      phone: '+91-33-1234-5678',
      email: 'info@kolkata-gems.com',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
