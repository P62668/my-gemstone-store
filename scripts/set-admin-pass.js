const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const newPwd = process.argv[2] || process.env.ADMIN_PASSWORD || 'Admin@123!';

(async () => {
  try {
    const hash = bcrypt.hashSync(newPwd, 10);
    const updated = await prisma.user.update({ where: { email: 'admin@shankarmala.com' }, data: { password: hash } });
    console.log('Updated admin password for', updated.email);
    console.log('New plaintext password:', newPwd);
  } catch (e) {
    console.error('Failed to update admin password', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
