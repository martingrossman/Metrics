const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');

const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

for (const device of [
  { name: 'desktop mouse', engine: chromium, viewport: { width: 1440, height: 900 } },
  { name: 'Android touch', engine: chromium, viewport: { width: 412, height: 915 }, touch: true },
  { name: 'iPhone-size touch', engine: chromium, viewport: { width: 402, height: 714 }, touch: true },
  { name: 'WebKit mobile pointer', engine: webkit, viewport: { width: 402, height: 714 }, mobile: true }
]) {
  test(`graph threshold: ${device.name}`, {
    skip: !fs.existsSync(device.engine.executablePath()) && `${device.engine.name()} is not installed`
  }, async () => {
    const browser = await device.engine.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: device.viewport, isMobile: Boolean(device.touch || device.mobile),
        hasTouch: Boolean(device.touch || device.mobile), reducedMotion: 'reduce'
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      assert.equal(await page.locator('label[for="presetSelect"]').textContent(), 'Try an example');
      assert.equal(await page.locator('label[for="presetSelect"]').isVisible(), true);
      assert.equal(await page.locator('#presetSelect').inputValue(), 'balanced');
      assert.deepEqual(await page.locator('#presetSelect option:not([disabled])').allTextContents(),
        ['Medical test', 'Car braking', 'Spam filter', 'Fraud detection', 'Generic ML']);
      const cdp = device.touch ? await page.context().newCDPSession(page) : null;
      const point = fraction => page.evaluate(fraction => {
        const plot = document.getElementById('plot');
        const grip = plot.querySelector('.threshold-grip');
        const p = plot.createSVGPoint();
        p.x = fraction === null ? Number(grip.getAttribute('x')) + Number(grip.getAttribute('width')) / 2 : 190 + fraction * 410;
        p.y = Number(grip.getAttribute('y')) + Number(grip.getAttribute('height')) / 2;
        const screen = p.matrixTransform(plot.getScreenCTM());
        return { x: screen.x, y: screen.y };
      }, fraction);
      const input = async (type, p) => {
        if (cdp) {
          await cdp.send('Input.dispatchTouchEvent', {
            type, touchPoints: ['touchEnd', 'touchCancel'].includes(type) ? [] : [{ ...p, id: 0 }]
          });
        } else if (type === 'touchStart') {
          await page.mouse.move(p.x, p.y);
          await page.mouse.down();
        } else if (type === 'touchMove') {
          await page.mouse.move(p.x, p.y, { steps: 4 });
        } else {
          await page.mouse.up();
        }
      };
      const check = async (cutoff, generic = false) => {
        // Touch moves are delivered on the browser's next animation frame.
        await page.waitForFunction(value => document.getElementById('plot').getAttribute('aria-valuenow') === String(value), cutoff);
        assert.equal(await page.locator('#threshold').inputValue(), String(generic ? cutoff : 100 - cutoff));
        assert.equal(await page.locator('#plot').getAttribute('aria-valuenow'), String(cutoff));
        assert.equal(await page.locator('#prevalence').inputValue(), '50');
        assert.equal(await page.locator('#separation').inputValue(), '60');
      };
      const state = () => page.locator('#tpr, #fpr, #precision, #tpNum, #fpNum, #fnNum, #tnNum').allTextContents();
      const geometry = await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
      const baseline = await state();

      // Capture survives repeated redraws and moving beyond the line's hit area.
      await input('touchStart', await point(null));
      for (const cutoff of [25, 75, 20]) {
        await input('touchMove', await point(cutoff / 100));
        await check(cutoff);
      }
      assert.notDeepEqual(await state(), baseline);
      const draggedState = await state();
      await input('touchEnd');
      assert.equal(await page.locator('#plot').evaluate(e => e.classList.contains('dragging')), false);
      await page.locator('#threshold').evaluate(e => {
        e.value = '80';
        e.dispatchEvent(new Event('input', { bubbles: true }));
      });
      assert.deepEqual(await state(), draggedState);

      // Clamp at either edge, even when a captured pointer leaves the plot.
      await input('touchStart', await point(null));
      await input('touchMove', await point(-0.1));
      await check(0);
      await input('touchMove', await point(1.1));
      await check(100);
      await input('touchEnd');
      await page.locator('#reset').click();

      // A grab near the line must not jump the threshold on pointerdown.
      const near = await point(null);
      near.x += 14;
      near.y += 28;
      await input('touchStart', near);
      await check(50);
      const to = await point(0.65);
      await input('touchMove', { x: to.x + 14, y: near.y });
      await check(65);
      await input(device.touch ? 'touchCancel' : 'touchEnd');
      assert.equal(await page.locator('#plot').evaluate(e => e.classList.contains('dragging')), false);

      await page.locator('#presetSelect').selectOption('generic');
      await check(50, true);
      await input('touchStart', await point(null));
      await input('touchMove', await point(0.4));
      await input('touchEnd');
      await check(40, true);
      await page.locator('#presetSelect').selectOption('balanced');
      await check(50);

      await page.locator('#plot').focus();
      for (const [key, cutoff] of [['ArrowRight', 51], ['ArrowLeft', 50], ['Home', 0], ['End', 100]]) {
        await page.keyboard.press(key);
        await check(cutoff);
        assert.equal(await page.locator('#plot').evaluate(e => e === document.activeElement), true);
      }
      assert.deepEqual(await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height)), geometry);
      assert.equal(await page.evaluate(() => scrollY), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (device.touch || device.mobile) {
        assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), false);
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
