// Optional local preview: node preview-server.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = new Map([
  ['index.html', 'text/html; charset=utf-8'],
  ['style.css', 'text/css; charset=utf-8'],
  ['app.js', 'text/javascript; charset=utf-8'],
  ['textbook-sets.js', 'text/javascript; charset=utf-8'],
  ['sw.js', 'text/javascript; charset=utf-8'],
  ['manifest.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['icon.svg', 'image/svg+xml; charset=utf-8'],
  ['icon-192.png', 'image/png'],
  ['icon-512.png', 'image/png']
]);
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html'; }
  catch { res.writeHead(400); res.end(); return; }
  if (!assets.has(name)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', assets.get(name));
  res.setHeader('Cache-Control', 'no-store');
  if (name === 'sw.js') res.setHeader('Service-Worker-Allowed', '/');
  const stream = fs.createReadStream(path.join(__dirname, name));
  stream.on('error', () => { res.statusCode = 500; res.end('Unable to load asset'); });
  stream.pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
