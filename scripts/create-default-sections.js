const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultSections() {
  try {
    console.log('Creating default homepage sections...');

    // Default sections to create
    const defaultSections = [
      {
        key: 'categories',
        title: 'Explore Our Collections',
        subtitle: 'Discover gemstones from every corner of the world',
        content: 'Browse our curated collections of precious and semi-precious gemstones',
        image: '',
        active: true,
        order: 2,
      },
      {
        key: 'featured',
        title: 'Featured Gemstones',
        subtitle: 'Handpicked treasures from our collection',
        content:
          'Our most sought-after gemstones, carefully selected for their exceptional quality',
        image: '',
        active: true,
        order: 3,
      },
      {
        key: 'testimonials',
        title: 'What Our Customers Say',
        subtitle: 'Trusted by gemstone enthusiasts worldwide',
        content:
          'Read testimonials from our satisfied customers who have experienced the quality of our gemstones',
        image: '',
        active: true,
        order: 4,
      },
      {
        key: 'about',
        title: 'Our Heritage',
        subtitle: 'A legacy of excellence in gemstones',
        content:
          'Discover the rich history and expertise that makes Shankarmala the trusted name in gemstones',
        image: '',
        active: true,
        order: 5,
      },
    ];

    for (const section of defaultSections) {
      try {
        await prisma.homepageSection.upsert({
          where: { key: section.key },
          update: {
            content: section,
            order: section.order,
            active: section.active,
          },
          create: {
            key: section.key,
            content: section,
            order: section.order,
            active: section.active,
          },
        });
        console.log(`✅ Created/Updated section: ${section.key}`);
      } catch (error) {
        console.error(`❌ Error creating section ${section.key}:`, error);
      }
    }

    console.log('Default sections creation completed!');
  } catch (error) {
    console.error('Error creating default sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultSections();
