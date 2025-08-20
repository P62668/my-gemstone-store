import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageData() {
  try {
    console.log('🔧 Fixing image data in database...');

    // Fix gemstone images
    const gemstones = await prisma.gemstone.findMany();
    console.log(`Found ${gemstones.length} gemstones to process`);

    for (const gemstone of gemstones) {
      let fixedImages = [];
      
      if (gemstone.images) {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(gemstone.images);
          if (Array.isArray(parsed)) {
            // Filter out empty strings and invalid entries
            fixedImages = parsed.filter(img => img && typeof img === 'string' && img.trim() !== '');
          }
        } catch (error) {
          // If parsing fails, treat as single image if it's not empty
          if (typeof gemstone.images === 'string' && gemstone.images.trim() !== '') {
            fixedImages = [gemstone.images];
          }
        }
      }

      // If no valid images found, use placeholder
      if (fixedImages.length === 0) {
        fixedImages = ['/images/placeholder-gemstone.jpg'];
      }

      // Update the gemstone with fixed images
      await prisma.gemstone.update({
        where: { id: gemstone.id },
        data: {
          images: JSON.stringify(fixedImages),
          stockQuantity: gemstone.stockCount || 0, // Ensure consistency
        }
      });

      console.log(`✅ Fixed gemstone ${gemstone.id}: ${gemstone.name}`);
    }

    // Fix homepage sections with malformed product data
    const homepageSections = await prisma.homepageSection.findMany({
      where: { key: 'featured_products' }
    });

    for (const section of homepageSections) {
      if (section.content) {
        try {
          const content = typeof section.content === 'string' 
            ? JSON.parse(section.content) 
            : section.content;

          // Remove malformed product data from content
          if (content.products) {
            delete content.products;
          }

          await prisma.homepageSection.update({
            where: { id: section.id },
            data: {
              content: content
            }
          });

          console.log(`✅ Fixed homepage section ${section.id}`);
        } catch (error) {
          console.error(`❌ Error fixing homepage section ${section.id}:`, error);
        }
      }
    }

    console.log('🎉 Database image data fix completed!');
  } catch (error) {
    console.error('❌ Error fixing image data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixImageData();
