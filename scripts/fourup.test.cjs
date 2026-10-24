const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');

for (const device of [
  { name: 'laptop', browser: chromium, width: 1366, height: 768 },
  { name: 'wide desktop', browser: chromium, width: 1680, height: 880 },
  { name: 'phone', browser: chromium, width: 390, height: 844 },
  { name: 'iPhone WebKit', browser: webkit, width: 390, height: 844 }
]) {
  test(`4-up switches and redraws: ${device.name}`, {
    skip: !fs.existsSync(device.browser.executablePath())
  }, async () => {
    const browser = await device.browser.launch();
    try {
      const page = await browser.newPage({ viewport: { width: device.width, height: device.height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      const values = () => page.locator('#tpr, #fpr, #precision').allTextContents();
      const baseline = await values();
      const defaultBox = await page.locator('#plot').getAttribute('viewBox');

      // First click must redraw all charts; no slider event should be needed.
      await page.locator('#tabGraphSplit').click();
      for (const id of ['plot','gaussPlot','rocPlot','prPlot']) {
        assert.equal(await page.locator(`#${id}`).isVisible(), true);
        assert.equal(await page.locator(`#${id}`).getAttribute('viewBox'), '0 0 650 270');
      }
      assert.equal(await page.locator('#matrixPanel').isVisible(), false);
      assert.deepEqual(await values(), baseline);
      assert.equal(await page.locator('#gaussPlot').textContent().then(text => text.includes('WHY PRECISION DROPS')), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (device.width >= 1000) {
        assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), false);
      }

      const point = async fraction => page.locator('#plot').evaluate((svg, fraction) => {
        const grip = svg.querySelector('.threshold-grip');
        const background = svg.querySelector('rect');
        const svgPoint = svg.createSVGPoint();
        // Both threshold background rectangles together span the plotted score range.
        const backgrounds = [...svg.querySelectorAll(':scope > rect')].slice(0, 2);
        const left = Number(background.getAttribute('x'));
        const width = backgrounds.reduce((sum, rect) => sum + Number(rect.getAttribute('width')), 0);
        svgPoint.x = fraction === null ? Number(grip.getAttribute('x')) + Number(grip.getAttribute('width')) / 2 : left + fraction * width;
        svgPoint.y = Number(grip.getAttribute('y')) + Number(grip.getAttribute('height')) / 2;
        const screen = svgPoint.matrixTransform(svg.getScreenCTM());
        return { x: screen.x, y: screen.y };
      }, fraction);
      const start = await point(null), end = await point(0.75);
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 4 });
      await page.mouse.up();
      assert.equal(await page.locator('#threshold').inputValue(), '25');
      assert.equal(await page.locator('#plot').getAttribute('aria-valuenow'), '75');

      await page.locator('#tabGraphScores').click();
      assert.equal(await page.locator('#plot').getAttribute('viewBox'), defaultBox);
      assert.equal(await page.locator('#matrixPanel').isVisible(), true);
      await page.locator('#tabGraphRoc').click();
      assert.equal(await page.locator('#rocPlot').getAttribute('viewBox'), defaultBox);
      await page.locator('#tabGraphSplit').click();
      assert.equal(await page.locator('#rocPlot').getAttribute('viewBox'), '0 0 650 270');
      await page.locator('#reset').click();
      assert.equal(await page.locator('#matrixPanel').isVisible(), true);
      assert.deepEqual(await values(), baseline);
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
