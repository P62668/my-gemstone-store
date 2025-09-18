// Fallback seeder using better-sqlite3 to populate prisma/dev.db without Prisma client
// Usage: npm run seed:sqlite

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.resolve(__dirname, '../prisma/dev.db');
if (!fs.existsSync(DB_PATH)) {
  console.error('Database file not found at', DB_PATH);
  process.exit(1);
}

const Database = require('better-sqlite3');
const db = new Database(DB_PATH);

function run() {
  const now = new Date().toISOString();
  // Ensure foreign key checks are disabled for initial seeding order problems,
  // then re-enable after the transaction to preserve DB integrity.
  db.pragma('foreign_keys = OFF');

  // Wrap in transaction
  const trx = db.transaction(() => {
    // Categories
    const categories = [
      { id: 1, name: 'Diamonds', description: 'The king of gemstones', image: '/images/categories/diamonds.jpg', active: 1 },
      { id: 2, name: 'Rubies', description: 'Precious red gemstones', image: '/images/categories/rubies.jpg', active: 1 },
      { id: 3, name: 'Sapphires', description: 'Royal blue gemstones', image: '/images/categories/sapphires.jpg', active: 1 },
      { id: 4, name: 'Emeralds', description: 'Vibrant green gemstones', image: '/images/categories/emeralds.jpg', active: 1 },
      { id: 5, name: 'Pearls', description: 'Elegant natural pearls', image: '/images/categories/pearls.jpg', active: 1 },
      { id: 6, name: 'Opals', description: 'Playful color-changing gems', image: '/images/categories/opals.jpg', active: 1 },
      { id: 7, name: 'Amethysts', description: 'Beautiful purple crystals', image: '/images/categories/amethysts.jpg', active: 1 },
      { id: 8, name: 'Topaz', description: 'Brilliant colored gemstones', image: '/images/categories/topaz.jpg', active: 1 },
    ];

    const insertCategory = db.prepare(`INSERT OR REPLACE INTO categories (id, name, description, image, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const c of categories) {
      insertCategory.run(c.id, c.name, c.description, c.image, c.active, now, now);
    }

    // Users (admin + samples)
    const adminPassword = process.env.ADMIN_PASSWORD || require('crypto').randomBytes(12).toString('base64').replace(/\W/g, '').slice(0, 16);
    const hashed = bcrypt.hashSync(adminPassword, 10);

    const insertUser = db.prepare(`INSERT OR REPLACE INTO users (id, email, password, firstName, lastName, role, active, createdAt, updatedAt, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    insertUser.run(1, 'admin@shankarmala.com', hashed, 'Admin', 'User', 'admin', 1, now, now, 'Admin User');
    insertUser.run(2, 'john@shankarmala.com', bcrypt.hashSync('password123', 10), 'John', 'Doe', 'user', 1, now, now, 'John Doe');
    insertUser.run(3, 'jane@shankarmala.com', bcrypt.hashSync('password123', 10), 'Jane', 'Smith', 'user', 1, now, now, 'Jane Smith');

    // Gemstones - minimal set
    const gemstones = [
      { id: 1, name: 'Royal Blue Sapphire', description: 'Exquisite royal blue sapphire', price: 2500, categoryId: 3, images: JSON.stringify(['/images/gemstones/sapphire-1.jpg']), weight: 2.5, dimensions: '8x6mm', clarity: 'VS1', color: 'Royal Blue', cut: 'Oval', origin: 'Sri Lanka', certificate: 'GIA', stockCount: 5, featured: 1, active: 1 },
      { id: 2, name: 'Burmese Ruby', description: 'Rare Burmese ruby', price: 3500, categoryId: 2, images: JSON.stringify(['/images/gemstones/ruby-1.jpg']), weight: 1.8, dimensions: '7x5mm', clarity: 'VVS2', color: 'Pigeon Blood Red', cut: 'Round', origin: 'Myanmar', certificate: 'GIA', stockCount: 3, featured: 1, active: 1 },
    ];

    const insertGem = db.prepare(`INSERT OR REPLACE INTO gemstones (id, name, description, price, salePrice, categoryId, images, weight, dimensions, clarity, color, cut, origin, certificate, stockCount, stockQuantity, lowStockThreshold, featured, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const g of gemstones) {
      insertGem.run(g.id, g.name, g.description, g.price, null, g.categoryId, g.images, g.weight, g.dimensions, g.clarity, g.color, g.cut, g.origin, g.certificate, g.stockCount, g.stockCount, 5, g.featured, g.active, now, now);
    }

    console.log('Seeded admin email=admin@shankarmala.com password=' + adminPassword);
  });

  trx();

  // Re-enable foreign key checks after seeding
  try {
    db.pragma('foreign_keys = ON');
  } catch (e) {
    // Non-fatal: some sqlite builds may not support setting pragma this way
    console.warn('Could not re-enable foreign_keys pragma:', e && e.message);
  }
}

try {
  run();
  console.log('SQLite seeding completed successfully');
  process.exit(0);
} catch (err) {
  console.error('SQLite seed error', err);
  process.exit(1);
}
