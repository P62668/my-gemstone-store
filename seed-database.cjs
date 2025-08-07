const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Rubies',
        description: 'Precious red gemstones known for their vibrant color and rarity',
        image: '/images/categories/ruby.jpg',
        order: 1,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Emeralds',
        description: 'Beautiful green gemstones prized for their rich color',
        image: '/images/categories/emerald.jpg',
        order: 2,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sapphires',
        description: 'Elegant blue gemstones symbolizing wisdom and nobility',
        image: '/images/categories/sapphire.jpg',
        order: 3,
        active: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Diamonds',
        description: 'The king of gemstones, known for brilliance and durability',
        image: '/images/categories/diamond.jpg',
        order: 4,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create gemstones
  console.log('Creating gemstones...');
  const gemstones = await Promise.all([
    prisma.gemstone.create({
      data: {
        name: 'Natural Burmese Ruby',
        type: 'Ruby',
        description:
          'Exquisite natural Burmese ruby with excellent clarity and vibrant red color. Certified by GIA.',
        price: 25000,
        images: JSON.stringify(['/images/ruby1.jpg', '/images/ruby2.jpg']),
        certification: 'GIA Certified',
        categoryId: categories[0].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Colombian Emerald',
        type: 'Emerald',
        description:
          'Rare Colombian emerald with deep green color and natural inclusions. Includes authenticity certificate.',
        price: 18000,
        images: JSON.stringify(['/images/emerald1.jpg', '/images/emerald2.jpg']),
        certification: 'Authenticity Certificate',
        categoryId: categories[1].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'Kashmir Blue Sapphire',
        type: 'Sapphire',
        description:
          'Exceptional Kashmir blue sapphire with velvety blue color. One of the finest specimens available.',
        price: 35000,
        images: JSON.stringify(['/images/sapphire1.jpg', '/images/sapphire2.jpg']),
        certification: 'GRS Certified',
        categoryId: categories[2].id,
      },
    }),
    prisma.gemstone.create({
      data: {
        name: 'D-Flawless Diamond',
        type: 'Diamond',
        description: 'Rare D-color flawless diamond with excellent cut, clarity, and carat weight.',
        price: 75000,
        images: JSON.stringify(['/images/diamond1.jpg', '/images/diamond2.jpg']),
        certification: 'GIA Certified',
        categoryId: categories[3].id,
      },
    }),
  ]);

  console.log(`Created ${gemstones.length} gemstones`);

  // Create users
  console.log('Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'hashed_password_123', // In real app, this would be properly hashed
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'hashed_password_456',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        password: 'hashed_password_789',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create orders
  console.log('Creating orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        total: 25000,
        status: 'pending',
        items: {
          create: {
            gemstoneId: gemstones[0].id,
            quantity: 1,
            price: 25000,
          },
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        total: 18000,
        status: 'processing',
        items: {
          create: {
            gemstoneId: gemstones[1].id,
            quantity: 1,
            price: 18000,
          },
        },
      },
    }),
  ]);

  console.log(`Created ${orders.length} orders`);

  // Create banners
  console.log('Creating banners...');
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: 'Exclusive Ruby Collection',
        subtitle: 'Discover our finest natural rubies',
        image: '/images/banner1.jpg',
        link: '/shop?category=ruby',
        order: 1,
        active: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Emerald Elegance',
        subtitle: 'Premium emerald stones for discerning buyers',
        image: '/images/banner2.jpg',
        link: '/shop?category=emerald',
        order: 2,
        active: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: 'Sapphire Showcase',
        subtitle: 'Rare blue sapphires from Kashmir',
        image: '/images/banner3.jpg',
        link: '/shop?category=sapphire',
        order: 3,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${banners.length} banners`);

  // Create testimonials
  console.log('Creating testimonials...');
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Rajesh Kumar',
        quote:
          'The quality of rubies I received exceeded my expectations. Kolkata Gems is truly the best in the business!',
        image: '/images/testimonial1.jpg',
        order: 1,
        active: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Priya Sharma',
        quote:
          'I was amazed by the authenticity certificate and the beautiful emerald stone. Highly recommended!',
        image: '/images/testimonial2.jpg',
        order: 2,
        active: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Amit Patel',
        quote: 'Professional service and genuine gemstones. I will definitely shop here again.',
        image: '/images/testimonial3.jpg',
        order: 3,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${testimonials.length} testimonials`);

  // Create FAQs
  console.log('Creating FAQs...');
  const faqs = await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'How can I verify the authenticity of your gemstones?',
        answer:
          'All our gemstones come with certified authenticity documents from recognized gemological laboratories. We also provide detailed certificates with each purchase.',
        order: 1,
        active: true,
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy for all purchases. The gemstone must be in its original condition with all certificates intact.',
        order: 2,
        active: true,
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Contact us for specific details.',
        order: 3,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${faqs.length} FAQs`);

  // Create press items
  console.log('Creating press items...');
  const press = await Promise.all([
    prisma.press.create({
      data: {
        title: 'Featured in Vogue India',
        logo: '/images/press1.jpg',
        link: 'https://vogue.in',
        order: 1,
        active: true,
      },
    }),
    prisma.press.create({
      data: {
        title: 'Mentioned in Economic Times',
        logo: '/images/press2.jpg',
        link: 'https://economictimes.indiatimes.com',
        order: 2,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${press.length} press items`);

  // Create site settings
  console.log('Creating site settings...');
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      about:
        'Welcome to Kolkata Gems, your premier destination for authentic and certified gemstones. We specialize in rare and precious stones sourced from the finest locations worldwide.',
      contact: 'For inquiries about our gemstone collection, please contact our expert team.',
      address: '123 Luxury Lane, Gem City, GC 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@luxurygemstones.com',
    },
  });

  console.log('Created site settings');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
