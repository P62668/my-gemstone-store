import { PrismaClient } from '@prisma/client';
import { sampleUserData, sampleGemstones } from '../utils/sample-data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user if not exists
  const adminEmail = 'admin@shankarmala.com';
  const adminPassword = 'Admin@123'; // Change for production!
  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    },
  });
  console.log('Admin user seeded:', { email: adminEmail, password: adminPassword });

  // Seed users
  for (const user of sampleUserData) {
    await prisma.user.upsert({
      where: { id: Number(user.id) },
      update: {},
      create: {
        id: Number(user.id),
        name: user.name,
        email: `${user.name.toLowerCase()}@shankarmala.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      },
    });
  }

  // Seed gemstones
  for (const gem of sampleGemstones) {
    await prisma.gemstone.upsert({
      where: { id: Number(gem.id) },
      update: {},
      create: {
        id: Number(gem.id),
        name: gem.name,
        type: gem.type,
        price: gem.price,
        images: JSON.stringify(gem.images),
        description: gem.description,
        certification: gem.certification,
      },
    });
  }

  // Seed default SEOSettings if not exists
  const existingSEO = await prisma.sEOSettings.findUnique({ where: { id: 1 } });
  if (!existingSEO) {
    await prisma.sEOSettings.create({
      data: {
        id: 1,
        global: {},
        pages: {},
        social: {},
        analytics: {},
        structuredData: {},
      },
    });
    console.log('Seeded default SEOSettings');
  } else {
    console.log('SEOSettings already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
