// Diagnostic script to test Prisma native engine loading
const fs = require('fs');
const path = require('path');

function print(msg, val) { console.log(`${msg}:`, val); }

console.log('--- Prisma diagnostic script ---');
print('platform', process.platform);
print('arch', process.arch);
print('node version', process.version);

const envs = ['PRISMA_CLIENT_ENGINE_TYPE','PRISMA_FORCE_NAPI','PRISMA_QUERY_ENGINE_LIBRARY','PRISMA_WASM_ENGINE_THREADS','DATABASE_URL'];
envs.forEach(e => print(e, process.env[e] || '(not set)'));

const candidates = [
  path.resolve('node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node'),
  path.resolve('generated/prisma/libquery_engine-darwin-arm64.dylib.node'),
  path.resolve('node_modules/prisma/libquery_engine-darwin-arm64.dylib.node'),
  path.resolve('node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node')
];

console.log('\nChecking engine candidate files:');
candidates.forEach(p => {
  try {
    const st = fs.statSync(p);
    console.log(p, 'exists, size=', st.size);
  } catch (err) {
    console.log(p, 'missing');
  }
});

// Try to force env and load Prisma
const enginePath = candidates.find(p => fs.existsSync(p));
if (enginePath) {
  console.log('\nSetting PRISMA_QUERY_ENGINE_LIBRARY to', enginePath);
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
  process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
  process.env.PRISMA_FORCE_NAPI = '1';
} else {
  console.log('\nNo native engine file found, will attempt library load anyway');
  process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
  process.env.PRISMA_FORCE_NAPI = '1';
}

(async function(){
  try {
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient required successfully');
    const prisma = new PrismaClient({ log: ['info','warn','error'] });
    prisma.$on('info', e => console.log('[prisma][info]', e.message));
    prisma.$on('warn', e => console.log('[prisma][warn]', e.message));
    prisma.$on('error', e => console.log('[prisma][error]', e));

    console.log('\nCalling prisma.$connect()');
    await prisma.$connect();
    console.log('Connected OK');
    try {
      console.log('\nRunning test query: category.findMany()');
      const cats = await prisma.category.findMany({ take: 1 });
      console.log('Query OK, result length=', cats.length);
    } catch(qe){
      console.error('Query error:', qe && qe.message, '\nstack:\n', qe && qe.stack);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error requiring/initializing PrismaClient: ', e && e.message);
    console.error(e && e.stack);
    process.exit(2);
  }
})();
