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
  const reference = model.generateExamples(500, separation / 100);
  for (let prevalence = 0; prevalence <= 100; prevalence++) {
    const examples = model.generateExamples(prevalence * 10, separation / 100);
    assert.deepEqual(examples.map(e => e.score), reference.map(e => e.score));
    for (let threshold = 0; threshold <= 100; threshold += 5) {
      const groups = model.classifyExamples(examples, threshold / 100);
      const metrics = model.calculateMetrics(groups);
      const markers = model.createCountGroups(groups);
      close(metrics.tp + metrics.fp + metrics.fn + metrics.tn, 1000);
      close(metrics.tp + metrics.fn, prevalence * 10);
      for (const outcome of Object.keys(groups)) {
        close(model.weightedCount(markers[outcome]), metrics[outcome]);
        assert.ok(markers[outcome].every(e => e.weight > 0 && e.weight <= 10));
        assert.ok(markers[outcome].every(e =>
          (e.score + 1e-9 >= threshold / 100) === ['tp', 'fp'].includes(outcome)));
      }
      if (prevalence) close(metrics.tpr, reference.filter(e => e.isPositive && e.score + 1e-9 >= threshold / 100).length / 50);
      else assert.ok(Number.isNaN(metrics.tpr));
      if (prevalence < 100) close(metrics.fpr, reference.filter(e => !e.isPositive && e.score + 1e-9 >= threshold / 100).length / 50);
      else assert.ok(Number.isNaN(metrics.fpr));
      if (separation === 100 && threshold === 50) assert.equal(metrics.fp + metrics.fn, 0);
      if (threshold === 100) {
        close(metrics.tp + metrics.fp, 0);
        assert.ok(Number.isNaN(metrics.precision));
      }
      if (threshold === 0) {
        close(metrics.fn + metrics.tn, 0);
        close(metrics.precision, prevalence / 100);
      }
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

    for (const width of [320, 350, 360, 375, 402, 500, 650, 651, 685, 686, 750, 767, 768, 1050, 1051, 1100, 1169, 1170, 1250, 1251, 1279, 1280, 1400, 1439, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      let originalPanelHeights;
      for (const separation of [0, 60, 100]) {
        await setSlider('separation', separation);
        for (const prevalence of [0, 10, 50, 100]) {
          await setSlider('prevalence', prevalence);
          for (const threshold of [0, 50, 100]) {
            await setSlider('threshold', threshold);
            const layout = await page.evaluate(() => ({
              overflow: document.documentElement.scrollWidth > innerWidth,
              clipped: [...document.querySelectorAll('.tiles, .group')].some(e => e.scrollHeight > e.clientHeight + 1),
              panelHeights: [...document.querySelectorAll('.panel')].map(e => e.getBoundingClientRect().height),
              dots: document.querySelectorAll('circle[data-id]').length,
              squares: document.querySelectorAll('.tile[data-id]').length,
              clippedLabels: [...document.querySelectorAll('#plot text')].filter(e => {
                const box = e.getBBox();
                const view = document.querySelector('#plot').viewBox.baseVal;
                return box.x < 0 || box.y < 0 || box.x + box.width > view.width || box.y + box.height > view.height;
              }).map(e => e.textContent)
            }));
            assert.equal(layout.overflow, false, `Horizontal overflow at ${width}px`);
            assert.equal(layout.clipped, false, `Clipped population markers at ${width}px, separation ${separation}, prevalence ${prevalence}, threshold ${threshold}`);
            assert.equal(layout.dots, layout.squares);
            assert.deepEqual(layout.clippedLabels, [], `Clipped graph labels at ${width}px, prevalence ${prevalence}`);
            originalPanelHeights ??= layout.panelHeights;
            assert.deepEqual(layout.panelHeights, originalPanelHeights, `Graph resized at ${width}px, separation ${separation}, prevalence ${prevalence}, threshold ${threshold}`);
          }
        }
      }
    }
    for (const [width, height] of [[1280, 800], [1366, 768], [1440, 768]]) {
      await page.setViewportSize({ width, height });
      let originalPanelHeights;
      for (const prevalence of [0, 50, 100]) {
        await setSlider('prevalence', prevalence);
        for (const threshold of [0, 50, 100]) {
          await setSlider('threshold', threshold);
          const layout = await page.evaluate(() => ({
            scroll: document.documentElement.scrollHeight > innerHeight,
            clipped: [...document.querySelectorAll('.tiles, .group')].some(e => e.scrollHeight > e.clientHeight + 1),
            panelHeights: [...document.querySelectorAll('.panel')].map(e => e.getBoundingClientRect().height)
          }));
          assert.equal(layout.scroll, false, `Desktop overflow at ${width}×${height}, prevalence ${prevalence}, threshold ${threshold}`);
          assert.equal(layout.clipped, false, `Clipped desktop matrix at ${width}×${height}, prevalence ${prevalence}, threshold ${threshold}`);
          originalPanelHeights ??= layout.panelHeights;
          assert.deepEqual(layout.panelHeights, originalPanelHeights, `Graph resized at ${width}×${height}, prevalence ${prevalence}, threshold ${threshold}`);
        }
      }
    }
    await page.locator('#reset').click();
    assert.equal(await page.locator('#prevalence').inputValue(), '50');
    assert.equal(await page.locator('#threshold').inputValue(), '50');
    assert.equal(await page.locator('#separation').inputValue(), '60');
    // In the flu view, moving sensitivity right admits weaker signals.
    let previousPositiveCount = -1;
    for (const sensitivity of [0, 25, 50, 75, 100]) {
      await setSlider('threshold', sensitivity);
      const positiveCount = Number(await page.locator('#tpNum').textContent()) +
        Number(await page.locator('#fpNum').textContent());
      assert.ok(positiveCount >= previousPositiveCount);
      if (sensitivity === 0) assert.equal(positiveCount, 0);
      if (sensitivity === 100) assert.equal(positiveCount, 1000);
      previousPositiveCount = positiveCount;
    }
    await page.locator('#reset').click();
    // Balance presets change only prevalence, including with custom test settings.
    await setSlider('threshold', 63);
    await setSlider('separation', 35);
    const fixedTpr = await page.locator('#tpr').textContent();
    const fixedFpr = await page.locator('#fpr').textContent();
    for (const share of ['10', '50']) {
      await page.locator(`#balance${share}`).click();
      assert.equal(await page.locator(`#balance${share}`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#prevalence').inputValue(), share);
      assert.equal(await page.locator('#threshold').inputValue(), '63');
      assert.equal(await page.locator('#separation').inputValue(), '35');
      assert.equal(await page.locator('#tpr').textContent(), fixedTpr);
      assert.equal(await page.locator('#fpr').textContent(), fixedFpr);
    }
    // Switching terminology preserves the effective cutoff and all model results.
    const numericState = () => page.evaluate(() => ({
      otherSliders: ['prevalence', 'separation'].map(id => document.getElementById(id).value),
      cutoff: document.querySelector('#plot line[stroke-dasharray]').getAttribute('x1'),
      values: ['tpr', 'fpr', 'precision', 'tpNum', 'fpNum', 'fnNum', 'tnNum', 'summary']
        .map(id => document.getElementById(id).textContent),
      points: [...document.querySelectorAll('#plot circle')]
        .map(e => ['cx', 'cy', 'r', 'fill'].map(attribute => e.getAttribute(attribute)))
    }));
    const beforeModeChange = await numericState();
    await page.locator('#modeToggle').click();
    assert.deepEqual(await numericState(), beforeModeChange);
    assert.equal(await page.locator('#threshold').inputValue(), '37');
    assert.equal(await page.locator('#shareLabel').textContent(), 'Positive share');
    assert.ok((await page.locator('#plot').textContent()).includes('Actual +'));
    assert.ok(!(await page.locator('#intro').textContent()).includes('flu'));
    assert.ok(!(await page.locator('.tile').first().getAttribute('title')).includes('flu'));
    await page.locator('#modeToggle').click();
    assert.deepEqual(await numericState(), beforeModeChange);
    assert.equal(await page.locator('#threshold').inputValue(), '63');
    assert.equal(await page.locator('#shareLabel').textContent(), 'Sick share');
    assert.ok((await page.locator('#intro').textContent()).includes('also depends'));
    await setSlider('prevalence', 27);
    assert.equal(await page.locator('.balance-preset[aria-pressed="true"]').count(), 0);
    await page.locator('#balance10').click();
    assert.equal(await page.locator('#prevalence').inputValue(), '10');
    await page.locator('#reset').click();
    assert.equal(await page.locator('#prevalence').inputValue(), '50');
    // The visible story: change only class balance, keeping the model fixed.
    for (const [prevalence, precision] of [[1, '19.5%'], [10, '72.7%'], [50, '96%'], [90, '99.5%'], [99, '100%']]) {
      await setSlider('prevalence', prevalence);
      assert.equal(await page.locator('#tpr').textContent(), '96%');
      assert.equal(await page.locator('#fpr').textContent(), '4%');
      assert.equal(await page.locator('#precision').textContent(), precision);
    }
    await page.locator('#reset').click();
    assert.equal(await page.locator('#plot text').last().textContent(), 'Flu test score →');
    assert.deepEqual(await page.locator('#plot text').allTextContents().then(labels =>
      labels.filter(label => /^\d\.\d\d$/.test(label))), ['0.00', '0.25', '0.50', '0.75', '1.00']);
    // Both charts retain exact weights; matrix labels round only for display.
    for (const prevalence of [1, 10, 50, 99]) {
      await setSlider('prevalence', prevalence);
      const outcomes = await page.evaluate(() => {
        const colors = { tp: '#0ea976', fp: '#e64b60', fn: '#f2a527', tn: '#a4afc0' };
        return Object.entries(colors).map(([outcome, color]) => ({
          count: document.getElementById(`${outcome}Num`).textContent,
          dotCount: [...document.querySelectorAll(`#plot circle[fill="${color}"]`)]
            .reduce((sum, e) => sum + (Number(e.getAttribute('r')) / 8) ** 2 * 10, 0),
          tileCount: [...document.querySelectorAll(`#${outcome}Tiles .tile`)]
            .reduce((sum, e) => sum + Number(e.style.getPropertyValue('--weight-scale')) ** 2 * 10, 0)
        }));
      });
      for (const outcome of outcomes) {
        assert.match(outcome.count, /^\d+$/);
        assert.equal(Number(outcome.count), Math.round(outcome.dotCount));
        close(outcome.dotCount, outcome.tileCount);
      }
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
    await setSlider('threshold', 0);
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
    console.log('Browser: redirect, controls, reset, hover, endpoints, and 25 stable responsive widths passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
