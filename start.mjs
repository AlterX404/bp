import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {networkInterfaces} from 'node:os';
const lan = process.argv.includes('--lan');
const host = lan ? '0.0.0.0' : '127.0.0.1';
const configuredPort = process.env.BRAND_PULSE_PORT;
const port = Number(configuredPort || 4173);
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',jpg:'image/jpeg',txt:'text/plain; charset=utf-8'};
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('BRAND_PULSE_PORT must be a valid port number.');
const server = createServer(async (request, response) => {
  response.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  response.setHeader('Cache-Control','no-store');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    response.writeHead(405).end('Method not allowed');
    return;
  }
  const path = request.url.split('?')[0].slice(1) || 'index.html';
  const match = path.match(/^[a-z0-9-]+\.(html|css|js|jpg|txt)$/);
  if (!match) { response.writeHead(404).end('Not found'); return; }
  try {
    const content = await readFile(new URL('site/'+path,import.meta.url));
    response.setHeader('Content-Type',types[match[1]]);
    response.end(request.method==='HEAD'?undefined:content);
  } catch (error) {
    response.writeHead(error.code==='ENOENT'?404:500).end(error.code==='ENOENT'?'Not found':'Preview error');
  }
});
server.on('listening', () => {
  const actualPort = server.address().port;
  console.log('Desktop: http://127.0.0.1:'+actualPort);
  if (!lan) return;
  const addresses = Object.values(networkInterfaces()).flat().filter(ip => ip.family === 'IPv4' && !ip.internal);
  for (const ip of addresses) console.log('Phone: http://'+ip.address+':'+actualPort);
  if (!addresses.length) console.log('Connect this computer to your private Wi-Fi to get a phone URL.');
});
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && !configuredPort) {
    server.listen(0, host);
    return;
  }
  console.error('The preview could not start. ' + error.message);
  process.exitCode = 1;
});
server.listen(port, host);
