// Optional local preview: node preview-server.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = new Map([
  ['index.html', 'text/html'], ['style.css', 'text/css'],
  ['app.js', 'text/javascript'], ['textbook-sets.js', 'text/javascript'],
  ['sample-card-set.json', 'application/json']
]);
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html'; }
  catch { res.writeHead(400); res.end(); return; }
  if (!assets.has(name)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', `${assets.get(name)}; charset=utf-8`);
  res.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(path.join(__dirname, name));
  stream.on('error', () => { res.statusCode = 500; res.end('Unable to load asset'); });
  stream.pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
