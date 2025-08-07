const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.gemstone.deleteMany();
  await prisma.category.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.press.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Rubies',
        description: 'Precious red gemstones',
        image: '/images/ruby1.jpg',
        order: 1,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Emeralds',
        description: 'Beautiful green gemstones',
        image: '/images/emerald1.jpg',
        order: 2,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sapphires',
        description: 'Stunning blue gemstones',
        image: '/images/sapphire1.jpg',
        order: 3,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Diamonds',
        description: 'The king of gemstones',
        image: '/images/diamond1.jpg',
        order: 4,
        active: true,
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Create gemstones
  const gemstones = await Promise.all([
    prisma.gemstone.create({
      data: {
        name: 'Burmese Ruby',
        type: 'Ruby',
        description: 'Exquisite Burmese ruby with excellent clarity and color',
        price: 25000,
        images: '/images/ruby1.jpg,/images/ruby2.jpg',
        certification: 'GRS',
        categoryId: categories[0].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Colombian Emerald',
        type: 'Emerald',
        description: 'Rare Colombian emerald with garden inclusions',
        price: 18000,
        images: '/images/emerald1.jpg,/images/emerald2.jpg',
        certification: 'SSEF',
        categoryId: categories[1].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Kashmir Sapphire',
        type: 'Sapphire',
        description: 'Legendary Kashmir sapphire with velvety blue color',
        price: 35000,
        images: '/images/sapphire1.jpg',
        certification: 'GIA',
        categoryId: categories[2].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'D-Flawless Diamond',
        type: 'Diamond',
        description: 'Perfect D-color flawless diamond',
        price: 50000,
        images: '/images/diamond1.jpg',
        certification: 'GIA',
        categoryId: categories[3].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Pigeon Blood Ruby',
        type: 'Ruby',
        description: 'Rare pigeon blood ruby from Myanmar',
        price: 30000,
        images: '/images/ruby1.jpg',
        certification: 'GRS',
        categoryId: categories[0].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Zambian Emerald',
        type: 'Emerald',
        description: 'High-quality Zambian emerald',
        price: 12000,
        images: '/images/emerald1.jpg',
        certification: 'SSEF',
        categoryId: categories[1].id,
      },
    }),
  ]);

  console.log('✅ Created gemstones');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashedpassword456',
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: 'COMPLETED',
        total: 43000,
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        status: 'PENDING',
        total: 18000,
      },
    }),
  ]);

  console.log('✅ Created orders');

  // Create order items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        gemstoneId: gemstones[0].id,
        quantity: 1,
        price: 25000,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        gemstoneId: gemstones[1].id,
        quantity: 1,
        price: 18000,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        gemstoneId: gemstones[1].id,
        quantity: 1,
        price: 18000,
      },
    }),
  ]);

  console.log('✅ Created order items');

  // Create FAQs
  await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'How do I know if a gemstone is authentic?',
        answer:
          'All our gemstones come with certification from reputable laboratories like GIA, GRS, or SSEF. We also provide detailed documentation and authenticity guarantees.',
        order: 1,
        active: true,
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy for all gemstones. The item must be in its original condition with all certificates and documentation.',
        order: 2,
        active: true,
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.',
        order: 3,
        active: true,
      },
    }),
  ]);

  console.log('✅ Created FAQs');

  // Create banners
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Exquisite Gemstones',
        subtitle: 'Discover our collection of rare and beautiful gemstones',
        image: '/images/banner1.jpg',
        link: '/shop',
        active: true,
        order: 1,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Heritage Collection',
        subtitle: "Timeless pieces from Shankarmala's legacy",
        image: '/images/banner2.jpg',
        link: '/categories',
        active: true,
        order: 2,
      },
    }),
  ]);

  console.log('✅ Created banners');

  // Create testimonials
  await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Sarah Johnson',
        quote:
          "The quality of gemstones from Kolkata Gems is exceptional. I've been a customer for years and never been disappointed.",
        image: '/images/testimonial1.jpg',
        order: 1,
        active: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Michael Chen',
        quote:
          'As a jewelry designer, I need the finest gemstones. Kolkata Gems consistently delivers premium quality stones.',
        image: '/images/testimonial2.jpg',
        order: 2,
        active: true,
      },
    }),
  ]);

  console.log('✅ Created testimonials');

  // Create press mentions
  const press = await Promise.all([
    prisma.press.create({
      data: {
        title: 'Shankarmala Featured in Luxury Magazine',
        logo: '/images/press1.jpg',
        link: 'https://luxurymagazine.com/shankarmala-feature',
        active: true,
        order: 1,
      },
    }),
    prisma.press.create({
      data: {
        title: 'Top 10 Gemstone Dealers in India',
        logo: '/images/press2.jpg',
        link: 'https://jewelrytimes.com/top-dealers',
        active: true,
        order: 2,
      },
    }),
  ]);

  console.log('✅ Created press mentions');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
