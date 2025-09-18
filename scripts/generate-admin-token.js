#!/usr/bin/env node
// Usage: ADMIN_UNLOCK_SECRET=... node scripts/generate-admin-token.js --route=rl-test --identifier=test@example.com --ip=127.0.0.1
const crypto = require('crypto');
const argv = require('minimist')(process.argv.slice(2));

const secret = process.env.ADMIN_UNLOCK_SECRET;
if (!secret) {
  console.error('ADMIN_UNLOCK_SECRET must be set in environment');
  process.exit(2);
}

const route = argv.route || argv.r || '';
const identifier = argv.identifier || argv.i || '';
const ip = argv.ip || argv.p || 'unknown';
const ttl = Number(process.env.ADMIN_UNLOCK_TTL || '300');
const ts = Math.floor(Date.now() / 1000);

const payload = `${route}|${identifier}|${ip}|${ts}`;
const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log(`${ts}:${sig}`);

// Provide quick curl example
console.error('\nExample:');
console.error(`curl -X POST -H "X-ADMIN-TOKEN: ${ts}:${sig}" -H "Content-Type: application/json" -d '{"route":"${route}","identifier":"${identifier}","ip":"${ip}"}' https://your-host/api/admin/locks/clear`);
