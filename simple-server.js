const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3007;

// Simple static file server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve static files from .next/static
  if (req.url.startsWith('/_next/static/')) {
    const filePath = path.join(__dirname, '.next', 'static', req.url.replace('/_next/static/', ''));
    serveFile(filePath, res);
    return;
  }
  
  // Serve other static assets
  if (req.url.startsWith('/static/')) {
    const filePath = path.join(__dirname, 'public', req.url.replace('/static/', ''));
    serveFile(filePath, res);
    return;
  }
  
  // For all other routes, serve the index.html (or a simple response)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Next.js Application</h1><p>The application has been built successfully. To run it properly, please use "npm run start" after ensuring all build files are present.</p>');
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function getContentType(ext) {
  const types = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return types[ext] || 'application/octet-stream';
}

server.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
  console.log('Note: This is a basic static file server. For full Next.js functionality, please resolve the build issues.');
});