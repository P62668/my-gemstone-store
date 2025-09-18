const http = require('http');

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const url = new URL('/admin/login', base).toString();

http.get(url, (res) => {
  // Consider any 3xx redirect as a failure for this check
  if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
    console.error('Admin login redirected:', res.statusCode, res.headers.location);
    process.exit(2);
  }
  if (res.statusCode !== 200) {
    console.error('Unexpected status for /admin/login:', res.statusCode);
    process.exit(3);
  }
  console.log('/admin/login served OK (status 200)');
  process.exit(0);
}).on('error', (err) => {
  console.error('Error requesting /admin/login', err);
  process.exit(4);
});
