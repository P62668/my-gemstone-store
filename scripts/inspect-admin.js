const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const passwordToTest = process.argv[2];

(async () => {
  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@shankarmala.com' } });
    console.log('ADMIN RECORD:', { id: admin.id, email: admin.email, role: admin.role, active: admin.active, createdAt: admin.createdAt });
    if (passwordToTest) {
      const ok = bcrypt.compareSync(passwordToTest, admin.password);
      console.log('PASSWORD MATCH:', ok);
    } else {
      console.log('No password provided to compare.');
    }
  } catch (e) {
    console.error('Error inspecting admin:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
