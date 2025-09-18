const express = require('express');
const path = require('path');
const { createRequestHandler } = require('@remix-run/express');

const app = express();
const PORT = process.env.PORT || 3006;

// Serve static files
app.use(express.static(path.join(__dirname, '.next/static')));

// Handle all other requests
app.all('*', createRequestHandler({
  build: require(path.join(__dirname, '.next/server/pages-manifest.json')),
}));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});