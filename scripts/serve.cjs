const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const root = path.resolve(__dirname, '..');
// Share only the demo pages, even when another file exists in the repository.
const pages = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/cmatrixlab_minimal_readable.html', 'cmatrixlab_minimal_readable.html']
]);

function createServer() {
  return http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }

    const pathname = request.url.split('?')[0];
    if (pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    const filename = pages.get(pathname);
    if (!filename) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Not found');
      return;
    }

    try {
      const content = await fs.readFile(path.join(root, filename));
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      console.error(`Cannot read ${filename}: ${error.message}`);
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Unable to load the demo');
    }
  });
}

function start() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--port')) {
    console.error('Usage: npm run serve -- [--port 8080]');
    process.exitCode = 1;
    return;
  }
  const portText = args[1] ?? process.env.PORT ?? '8080';
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Port must be a whole number from 1 to 65535.');
    process.exitCode = 1;
    return;
  }

  const server = createServer();
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is in use. Try: npm run serve -- --port ${port === 65535 ? 8080 : port + 1}`
      : `Unable to start server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`\nCMatrixLab is running.\n\nThis computer: http://localhost:${port}/`);
    const addresses = new Set(Object.values(os.networkInterfaces()).flat()
      .filter(address => address && address.family === 'IPv4' && !address.internal)
      .map(address => address.address));
    for (const address of addresses) console.log(`Same Wi-Fi:   http://${address}:${port}/`);
    if (!addresses.size) console.log('Connect to Wi-Fi to get an address for other devices.');
    console.log('\nOpen a Same Wi-Fi address on your phone or another computer.');
    console.log('Keep this terminal open. Press Ctrl+C to stop sharing.\n');
  });
}

if (require.main === module) start();
module.exports = { createServer };
