const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('./serve.cjs');

test('Wi-Fi server serves the demo and excludes other repository files', async () => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/', '/index.html', '/?demo=1']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html; charset=utf-8/);
      assert.match(await response.text(), /CMatrixLab/);
    }
    const head = await fetch(base + '/index.html', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.ok(Number(head.headers.get('content-length')) > 0);
    assert.equal(await head.text(), '');
    for (const route of ['/README.md', '/package.json', '/.git/config', '/scripts/serve.cjs', '/%2e%2e/.git/config']) {
      assert.equal((await fetch(base + route)).status, 404);
    }
    const post = await fetch(base, { method: 'POST' });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('allow'), 'GET, HEAD');
    assert.equal((await fetch(base + '/favicon.ico')).status, 204);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('refresh serves the latest saved HTML without restarting', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmatrixlab-test-'));
  const filename = path.join(root, 'index.html');
  fs.writeFileSync(filename, '<title>Before</title>');
  const server = createServer(root);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/`;
  try {
    assert.match(await (await fetch(url)).text(), /Before/);
    fs.writeFileSync(filename, '<title>After</title>');
    assert.match(await (await fetch(url)).text(), /After/);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    fs.unlinkSync(filename);
    fs.rmdirSync(root);
  }
});
