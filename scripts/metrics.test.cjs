const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');
const fs = require('node:fs');

const expected = {
  tpr: { numerator: 'tp', denominator: ['tp', 'fn'] },
  fpr: { numerator: 'fp', denominator: ['fp', 'tn'] },
  precision: { numerator: 'tp', denominator: ['tp', 'fp'] }
};
for (const device of [
  { name: 'desktop', browser: chromium, width: 1440, height: 768 },
  { name: 'Android', browser: chromium, width: 412, height: 915, mobile: true },
  { name: 'iPhone WebKit', browser: webkit, width: 402, height: 714, mobile: true }
]) {
  test(`metric explanations: ${device.name}`, {
    skip: !fs.existsSync(device.browser.executablePath()) && 'Browser is not installed'
  }, async () => {
    const browser = await device.browser.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: device.width, height: device.height },
        isMobile: Boolean(device.mobile), hasTouch: Boolean(device.mobile)
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      const values = () => page.locator('#tpr, #fpr, #precision, #tpNum, #fpNum, #tnNum, #fnNum').allTextContents();
      const baseline = await values();
      const heights = await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
      const select = async name => {
        if (device.mobile) await page.locator(`#${name}Card`).tap();
        else await page.locator(`#${name}Card`).hover();
      };
      const verify = async name => {
        const actual = await page.evaluate(() => {
          const box = e => {
            const r = e.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          };
          const rect = selector => {
            const e = document.querySelector(selector);
            return ['x', 'y', 'width', 'height'].map(a => Number(e.getAttribute(a)));
          };
          return {
            selected: document.querySelector('.metric.active').dataset.metric,
            points: [...document.querySelectorAll('#plot .point')].map(e => ({
              outcome: e.dataset.outcome, excluded: e.classList.contains('metric-excluded')
            })),
            groups: Object.fromEntries(['tp', 'fp', 'tn', 'fn'].map(o => {
              const e = document.querySelector(`.group.${o}`);
              return [o, { excluded: e.classList.contains('metric-excluded'), box: box(e) }];
            })),
            outer: box(document.querySelector('#matrixDenominator')),
            inner: box(document.querySelector('#matrixNumerator')),
            scoreOuter: rect('.denominator-region'), scoreInner: rect('.numerator-region'),
            cutoff: Number(document.querySelector('#plot line[stroke-dasharray]').getAttribute('x1')),
            formula: document.querySelector('#markerKey').textContent,
            scroll: document.documentElement.scrollHeight > innerHeight,
            horizontal: document.documentElement.scrollWidth > innerWidth
          };
        });
        const rule = expected[name];
        assert.equal(actual.selected, name);
        for (const dot of actual.points) assert.equal(dot.excluded, !rule.denominator.includes(dot.outcome));
        for (const [outcome, group] of Object.entries(actual.groups)) {
          assert.equal(group.excluded, !rule.denominator.includes(outcome));
        }
        const denominatorBoxes = rule.denominator.map(o => actual.groups[o].box);
        const numeratorBox = actual.groups[rule.numerator].box;
        for (const edge of ['left', 'top', 'right', 'bottom']) {
          const start = ['left', 'top'].includes(edge);
          const outerEdge = (start ? Math.min : Math.max)(...denominatorBoxes.map(b => b[edge]));
          assert.ok(Math.abs(actual.outer[edge] - (outerEdge + (start ? -3 : 3))) < 1);
          assert.ok(Math.abs(actual.inner[edge] - (numeratorBox[edge] + (start ? 3 : -3))) < 1);
        }
        assert.equal(actual.scoreInner[0], actual.cutoff + 3);
        assert.equal(actual.scoreInner[2], Math.max(0, 190 + 410 - actual.cutoff - 6));
        assert.equal(actual.scoreOuter[0], (name === 'precision' ? actual.cutoff : 190) - 3);
        assert.equal(actual.scoreOuter[2], name === 'precision' ? Math.max(0, 190 + 410 - actual.cutoff + 6) : 410 + 6);
        assert.equal(actual.scoreInner[1], actual.scoreOuter[1] + 6);
        assert.equal(actual.scoreInner[3] + 6 <= actual.scoreOuter[3], true);
        assert.ok(actual.formula.includes(rule.denominator.join(' + ').toUpperCase()));
        assert.equal(actual.scroll, false);
        assert.equal(actual.horizontal, false);
        assert.deepEqual(await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height)), heights);
      };

      for (const name of Object.keys(expected)) {
        await select(name);
        await verify(name);
        assert.deepEqual(await values(), baseline);
        fs.mkdirSync(path.resolve(__dirname, '../artifacts'), { recursive: true });
        await page.screenshot({ path: path.resolve(__dirname, `../artifacts/metric-${device.name.replaceAll(' ', '-')}-${name}.png`) });
        if (device.mobile) await page.locator(`#${name}Card`).tap();
        else await page.locator('.brand').hover();
        assert.equal(await page.locator('.metric-regions').count(), 0);
        assert.equal(await page.locator('.metric-excluded').count(), 0);
      }

      // A pinned explanation follows slider changes and both terminology modes.
      if (device.mobile) await select('precision');
      else await page.locator('#precisionCard').click();
      await page.locator('#threshold').evaluate(e => { e.value = '70'; e.dispatchEvent(new Event('input')); });
      await verify('precision');
      if (device.mobile) await page.locator('#modeToggle').tap();
      else await page.locator('#modeToggle').click();
      await verify('precision');
      await page.locator('#prevalence').evaluate(e => { e.value = '0'; e.dispatchEvent(new Event('input')); });
      await verify('precision');
      await page.locator('#threshold').evaluate(e => { e.value = '100'; e.dispatchEvent(new Event('input')); });
      assert.equal(await page.locator('#precision').textContent(), 'N/A');
      await verify('precision');
      await page.locator('#reset').click();
      assert.equal(await page.locator('.metric-regions').count(), 0);
      if (!device.mobile) {
        await page.locator('#reset').focus();
        await page.keyboard.press('Tab');
        await verify('tpr');
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#tprCard').getAttribute('aria-pressed'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.metric-regions').count(), 0);
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
