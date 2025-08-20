const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const p = new PrismaClient({ log: ['query','info','warn','error'] });
  try{
    await p.$connect();
    const cats = await p.category.findMany();
    console.log('OK', cats.length);
  }catch(e){
    console.error('PRISMA ERROR:');
    console.error(e);
    process.exitCode = 1;
  }finally{
    await p.$disconnect();
  }
})();
