import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {networkInterfaces} from 'node:os';

const lan = process.argv.includes('--lan');
const host = lan ? '0.0.0.0' : '127.0.0.1';
const port = Number(process.env.BRAND_PULSE_PORT || 4173);
createServer((req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-store');
  const path = req.url.split('?')[0];
  if (path !== '/' && path !== '/index.html') {
    res.writeHead(404).end('Not found');
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(readFileSync(new URL('./dist/index.html', import.meta.url)));
}).listen(port, host, () => {
  console.log('Desktop: http://127.0.0.1:' + port);
  if (!lan) return;
  for (const adapter of Object.values(networkInterfaces())) {
    for (const ip of adapter) {
      if (ip.family === 'IPv4' && !ip.internal) console.log('Phone: http://' + ip.address + ':' + port);
    }
  }
});
