const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { parseArgs } = require('node:util');

function createServer(root = path.join(__dirname, '..')) {
  // Only the demo is shared; read it for each request so edits show on refresh.
  const pages = new Map([
    ['/', 'index.html'],
    ['/index.html', 'index.html']
  ]);

  return http.createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }

    const pathname = request.url.split('?')[0];
    const filename = pages.get(pathname);
    if (pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    if (!filename) {
      response.writeHead(404);
      response.end();
      return;
    }

    try {
      const content = fs.readFileSync(path.join(root, filename));
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      console.error(`Cannot read ${filename}: ${error.message}`);
      response.writeHead(500);
      response.end();
    }
  });
}

function start() {
  const { values } = parseArgs({ options: { port: { type: 'string', default: '8080' } } });
  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Port must be a whole number from 1 to 65535.');
  }

  const server = createServer();
  server.on('error', error => {
    console.error(`Unable to start server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`\nThis computer: http://localhost:${port}/`);
    for (const address of Object.values(os.networkInterfaces()).flat()) {
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`Same Wi-Fi:   http://${address.address}:${port}/`);
      }
    }
    console.log('\nSave an HTML edit, then refresh on your other device. Ctrl+C stops sharing.');
  });
}

if (require.main === module) {
  try {
    start();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { createServer };
