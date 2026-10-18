const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'cmatrixlab_minimal_readable.html');
const html = fs.readFileSync(filename, 'utf8');

// Inspect the standalone model without adding a production-only test API.
let source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
source = source.replace('(() => {', 'return (() => {').replace(
  /  update\(\);\s*\}\)\(\);/,
  '  return {generateExamples, classifyExamples, calculateMetrics, createCountGroups, weightedCount};\n})();'
);
const model = Function('document', 'window', source)({
  getElementById: () => ({ addEventListener() {} })
}, { matchMedia: () => ({ addEventListener() {} }) });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

let combinations = 0;
for (let separation = 0; separation <= 100; separation += 5) {
  const reference = model.generateExamples(50, separation / 100);
  for (let prevalence = 0; prevalence <= 100; prevalence++) {
    const examples = model.generateExamples(prevalence, separation / 100);
    assert.deepEqual(examples.map(e => e.score), reference.map(e => e.score));
    for (let threshold = 0; threshold <= 100; threshold += 5) {
      const groups = model.classifyExamples(examples, threshold / 100);
      const metrics = model.calculateMetrics(groups);
      const markers = model.createCountGroups(groups);
      close(metrics.tp + metrics.fp + metrics.fn + metrics.tn, 100);
      close(metrics.tp + metrics.fn, prevalence);
      for (const outcome of Object.keys(groups)) {
        close(model.weightedCount(markers[outcome]), metrics[outcome]);
        assert.ok(markers[outcome].every(e => e.weight > 0 && e.weight <= 1));
      }
      if (prevalence) close(metrics.tpr, reference.filter(e => e.isPositive && e.score + 1e-9 >= threshold / 100).length / 50);
      else assert.ok(Number.isNaN(metrics.tpr));
      if (prevalence < 100) close(metrics.fpr, reference.filter(e => !e.isPositive && e.score + 1e-9 >= threshold / 100).length / 50);
      else assert.ok(Number.isNaN(metrics.fpr));
      if (separation === 100 && threshold === 50) assert.equal(metrics.fp + metrics.fn, 0);
      if (threshold === 100) assert.ok(Number.isNaN(metrics.precision));
      if (threshold === 0) close(metrics.precision, prevalence / 100);
      combinations++;
    }
  }
}
console.log(`Model: ${combinations} combinations passed.`);

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.waitForURL('**/cmatrixlab_minimal_readable.html');
    const setSlider = async (id, value) => page.locator(`#${id}`).evaluate((input, value) => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(value));

    for (const width of [320, 375, 650, 768, 1050, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const prevalence of [0, 10, 50, 100]) {
        await setSlider('prevalence', prevalence);
        await setSlider('threshold', 0);
        const layout = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          clipped: [...document.querySelectorAll('.tiles')].some(e => e.scrollHeight > e.clientHeight + 1),
          dots: document.querySelectorAll('circle[data-id]').length,
          squares: document.querySelectorAll('.tile[data-id]').length
        }));
        assert.equal(layout.overflow, false, `Horizontal overflow at ${width}px`);
        assert.equal(layout.clipped, false, `Clipped population markers at ${width}px, prevalence ${prevalence}`);
        assert.equal(layout.dots, layout.squares);
      }
    }
    await page.locator('#reset').click();
    assert.equal(await page.locator('#prevalence').inputValue(), '10');
    assert.equal(await page.locator('#threshold').inputValue(), '50');
    assert.equal(await page.locator('#separation').inputValue(), '60');
    // The visible story: change only class balance, keeping the model fixed.
    for (const [prevalence, precision] of [[10, '72.7%'], [50, '96%'], [90, '99.5%']]) {
      await setSlider('prevalence', prevalence);
      assert.equal(await page.locator('#tpr').textContent(), '96%');
      assert.equal(await page.locator('#fpr').textContent(), '4%');
      assert.equal(await page.locator('#precision').textContent(), precision);
    }
    await page.locator('#reset').click();
    const dot = page.locator('circle[data-id]').first();
    const id = await dot.getAttribute('data-id');
    await dot.hover();
    assert.equal(await page.locator(`.tile[data-id="${id}"].focus`).count(), 1);
    await setSlider('prevalence', 0);
    assert.equal(await page.locator('#tpr').textContent(), 'N/A');
    await setSlider('prevalence', 100);
    assert.equal(await page.locator('#fpr').textContent(), 'N/A');
    await setSlider('threshold', 100);
    assert.equal(await page.locator('#precision').textContent(), 'N/A');
    await page.locator('#reset').click();
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    // Use the available portrait page height with browser toolbars visible.
    for (const height of [714, 754, 874]) {
      await page.setViewportSize({ width: 402, height });
      for (const prevalence of [0, 1, 10, 50, 99, 100]) {
        for (const threshold of [0, 50, 100]) {
          await setSlider('prevalence', prevalence);
          await setSlider('threshold', threshold);
          const fit = await page.evaluate(() => ({
            scroll: document.documentElement.scrollHeight > innerHeight,
            hiddenMarkers: [...document.querySelectorAll('.tiles')].some(e => e.scrollHeight > e.clientHeight + 1),
            summaryBottom: document.querySelector('.insight').getBoundingClientRect().bottom
          }));
          assert.equal(fit.scroll, false, `iPhone portrait overflow at ${height}px, prevalence ${prevalence}, threshold ${threshold}`);
          assert.equal(fit.hiddenMarkers, false);
          assert.ok(fit.summaryBottom <= height);
        }
      }
    }
    await page.locator('#reset').click();
    await page.setViewportSize({ width: 402, height: 714 });
    await page.screenshot({ path: path.join(root, 'artifacts', 'iphone17pro.png'), fullPage: true });
    for (const [name, width] of [['desktop', 1440], ['phone', 375]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: path.join(root, 'artifacts', `${name}.png`), fullPage: true });
    }
    assert.deepEqual(errors, []);
    console.log('Browser: redirect, controls, reset, hover, endpoints, and seven responsive widths passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
