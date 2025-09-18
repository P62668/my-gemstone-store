// Lightweight runner to invoke Next API handler functions for smoke tests
const handler = require('../pages/api/health').default;

function createMockReq() {
  return { method: 'GET' };
}

function createMockRes() {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { console.log('HEALTH CHECK RESPONSE:', JSON.stringify(payload, null, 2)); return payload; };
  return res;
}

(async () => {
  try {
    await handler(createMockReq(), createMockRes());
    process.exit(0);
  } catch (e) {
    console.error('Health check runner error', e);
    process.exit(1);
  }
})();
