import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kolkata-gems.com' },
    update: {},
    create: {
      email: 'admin@kolkata-gems.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      profileImage: '/images/placeholder-gemstone.jpg'
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = [
    {
      name: 'Precious Stones',
      description: 'Rare and valuable gemstones',
      profileImage: '/images/precious-stones.jpg'
    },
    {
      name: 'Semi-Precious Stones',
      description: 'Beautiful and affordable gemstones',
      profileImage: '/images/semi-precious.jpg'
    },
    {
      name: 'Rare Gems',
      description: 'Exceptionally rare and unique gemstones',
      profileImage: '/images/rare-gems.jpg'
    },
    {
      name: 'Birthstones',
      description: 'Traditional birthstones for each month',
      profileImage: '/images/birthstones.jpg'
    }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(createdCategory);
  }

  console.log('✅ Categories created');

  // Create gemstones
  const gemstones = [
    {
      name: 'Natural Ruby',
      type: 'Ruby',
      description: 'Beautiful natural ruby with excellent clarity and color. Pigeon blood red color with VS1 clarity.',
      price: 25000,
      categoryId: createdCategories[0].id,
      images: '/images/ruby1.jpg,/images/ruby2.jpg',
      certification: 'GIA Certified - Natural Ruby, No Heat Treatment',
      featured: true
    },
    {
      name: 'Natural Emerald',
      type: 'Emerald',
      description: 'Stunning emerald with rich green color and natural inclusions. Colombian origin with excellent clarity.',
      price: 35000,
      categoryId: createdCategories[0].id,
      images: '/images/emerald1.jpg,/images/emerald2.jpg',
      certification: 'GIA Certified - Natural Emerald, Minor Oil Enhancement',
      featured: true
    },
    {
      name: 'Natural Sapphire',
      type: 'Sapphire',
      description: 'Classic blue sapphire with excellent brilliance. Royal blue color with VVS2 clarity.',
      price: 28000,
      categoryId: createdCategories[0].id,
      images: '/images/sapphire1.jpg',
      certification: 'GIA Certified - Natural Sapphire, Heat Treated',
      featured: false
    },
    {
      name: 'Natural Diamond',
      type: 'Diamond',
      description: 'Brilliant white diamond with exceptional fire. D color with VVS1 clarity.',
      price: 75000,
      categoryId: createdCategories[0].id,
      images: '/images/diamond1.jpg',
      certification: 'GIA Certified - D Color, VVS1 Clarity, Excellent Cut',
      featured: true
    }
  ];

  for (const gemstone of gemstones) {
    await prisma.gemstone.upsert({
      where: { name: gemstone.name },
      update: {},
      create: gemstone,
    });
  }

  console.log('✅ Gemstones created');

  // Create homepage sections
  const homepageSections = [
    {
      key: 'hero',
      content: {
        title: 'Timeless Elegance',
        subtitle: "Discover the finest gemstones from Shankarmala's heritage jewelry collection",
        primaryCTA: 'Explore Collection',
        secondaryCTA: 'Learn Our Story',
        primaryCTALink: '/shop',
        secondaryCTALink: '/about',
        backgroundImage: '/images/banner1.jpg'
      },
      order: 1,
      active: true
    },
    {
      key: 'categories',
      content: {
        title: 'Shop by Category',
        subtitle: 'Browse our curated gemstone categories'
      },
      order: 2,
      active: true
    },
    {
      key: 'featured',
      content: {
        title: 'Featured Gemstones',
        subtitle: 'Our most coveted pieces'
      },
      order: 3,
      active: true
    },
    {
      key: 'testimonials',
      content: {
        title: 'Testimonials',
        subtitle: 'Hear from our delighted customers'
      },
      order: 4,
      active: true
    },
    {
      key: 'newsletter',
      content: {
        title: 'Stay in the Circle of Luxury',
        subtitle: "Get exclusive access to new collections, gemstone insights, and heritage stories. Join our connoisseur's list."
      },
      order: 5,
      active: true
    }
  ];

  for (const section of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  console.log('✅ Homepage sections created');

  // Create testimonials
  const testimonials = [
    {
      name: 'Priya Sharma',
      content: 'The quality of gemstones from Shankarmala is exceptional. I\'ve been sourcing from them for years.',
      active: true
    },
    {
      name: 'Rajesh Kumar',
      content: 'Their collection of rare gems is unmatched. The authenticity certificates give me complete peace of mind.',
      active: true
    },
    {
      name: 'Anita Patel',
      content: 'Perfect for bridal collections. The rubies and emeralds are absolutely stunning.',
      active: true
    }
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log('✅ Testimonials created');

  // Create FAQs
  const faqs = [
    {
      question: 'How can I verify the authenticity of your gemstones?',
      answer: 'All our gemstones come with GIA or IGI certificates. We also provide detailed documentation including origin, treatment, and quality specifications.',
      order: 1,
      active: true
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we offer worldwide shipping with proper insurance and tracking. International orders are shipped via DHL or FedEx.',
      order: 2,
      active: true
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all gemstones. Returns must be in original condition with all certificates.',
      order: 3,
      active: true
    },
    {
      question: 'Can I get a custom cut gemstone?',
      answer: 'Yes, we offer custom cutting services. Please contact us with your specifications and we\'ll provide a quote.',
      order: 4,
      active: true
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  console.log('✅ FAQs created');

  // Create press mentions
  const pressMentions = [
    {
      title: 'Shankarmala Featured in Luxury Gemstone Magazine',
      content: 'Shankarmala has been featured in the prestigious Luxury Gemstone Magazine for our exceptional collection and heritage.',
      active: true
    },
    {
      title: 'Top 10 Gemstone Dealers in India',
      content: 'Shankarmala has been recognized as one of the top 10 gemstone dealers in India by Jewelry Times.',
      active: true
    },
    {
      title: 'Heritage Jewelry: The Shankarmala Story',
      content: 'Our heritage and commitment to quality has been highlighted in Heritage India magazine.',
      active: true
    }
  ];

  for (const press of pressMentions) {
    await prisma.press.create({
      data: press,
    });
  }

  console.log('✅ Press mentions created');

  // Create navigation settings
  const navigationSettings = await prisma.navigationSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      menuItems: [
        { label: 'Home', url: '/', order: 1 },
        { label: 'Shop', url: '/shop', order: 2 },
        { label: 'About', url: '/about', order: 3 },
        { label: 'Contact', url: '/contact', order: 4 }
      ],
      footerLinks: [
        { label: 'Privacy Policy', url: '/privacy', order: 1 },
        { label: 'Terms of Service', url: '/terms', order: 2 },
        { label: 'Shipping Info', url: '/shipping', order: 3 },
        { label: 'Returns', url: '/returns', order: 4 }
      ],
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/shankarmala', order: 1 },
        { platform: 'instagram', url: 'https://instagram.com/shankarmala', order: 2 },
        { platform: 'twitter', url: 'https://twitter.com/shankarmala', order: 3 }
      ]
    },
  });

  console.log('✅ Navigation settings created');

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
