// Simple HTTP server for SNL Fixed Asset Management
// Used to serve asset-view.html over local network for QR scanning

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIR  = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  // strip query string
  const urlPath  = req.url.split('?')[0].split('#')[0];
  const filePath = path.join(DIR, urlPath === '/' ? 'index.html' : urlPath);
  const ext      = path.extname(filePath).toLowerCase();

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found: ' + urlPath);
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log('\n  ✅  Server running at http://localhost:' + PORT);
  console.log('  Your local IP addresses:\n');
  const nets = require('os').networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        console.log('       http://' + addr.address + ':' + PORT + '/asset-view.html');
      }
    }
  }
  console.log('\n  Copy one of the above URLs into the app:');
  console.log('  Settings > Asset Viewer Base URL\n');
  console.log('  Press Ctrl+C to stop.\n');
});
