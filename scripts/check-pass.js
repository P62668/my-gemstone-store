const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const pwd = process.argv[2];
(async () => {
  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@shankarmala.com' } });
    console.log('Stored hash:', admin.password);
    if (pwd) {
      console.log('Comparing with:', pwd);
      console.log('bcrypt.compareSync ->', bcrypt.compareSync(pwd, admin.password));
      console.log('bcrypt.hashSync(pwd) ->', bcrypt.hashSync(pwd, 10));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
