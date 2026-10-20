const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium, webkit } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

for (const device of [
  { name: 'desktop', browser: chromium, width: 1440, height: 768 },
  { name: 'Android', browser: chromium, width: 412, height: 915, mobile: true },
  { name: 'iPhone WebKit', browser: webkit, width: 402, height: 714, mobile: true },
  { name: 'small phone', browser: chromium, width: 320, height: 900, mobile: true }
]) {
  test(`learning view: ${device.name}`, { skip: !fs.existsSync(device.browser.executablePath()) }, async () => {
    const browser = await device.browser.launch();
    try {
      const page = await browser.newPage({ viewport: { width: device.width, height: device.height },
        isMobile: Boolean(device.mobile), hasTouch: Boolean(device.mobile), reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      const activate = selector => device.mobile ? page.locator(selector).tap() : page.locator(selector).click();
      const setSlider = (id, value) => page.locator(`#${id}`).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, String(value));
      const state = () => page.evaluate(() => ({
        values: ['tpr', 'fpr', 'precision', 'tpNum', 'fpNum', 'fnNum', 'tnNum'].map(id => document.getElementById(id).textContent),
        cutoff: document.querySelector('#plot line[stroke-dasharray]').getAttribute('x1'),
        points: [...document.querySelectorAll('#plot .point')].map(e => ['cx', 'cy', 'r', 'fill'].map(a => e.getAttribute(a)))
      }));
      const noOverflow = async (simple = false) => {
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        if (simple) assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), false);
      };
      const bayesEvidence = async (tp, fp, precision) => {
        assert.equal((await page.locator('[data-evidence="tp"]').textContent()).trim(), String(tp));
        assert.equal((await page.locator('[data-evidence="fp"]').textContent()).trim(), String(fp));
        assert.equal((await page.locator('#bayesPositiveTotal').textContent()).trim(), String(tp + fp));
        const ringValue = await page.locator('.probability-ring').getAttribute('data-value');
        if (precision === null) {
          assert.equal(ringValue, 'na');
        } else {
          assert.ok(Math.abs(Number(ringValue) - precision) < 1e-12, `Ring should show probability ${precision}, got ${ringValue}`);
        }
      };
      const comparisonProbability = async (share, expected) => {
        const value = await page.locator(`[data-learn-share="${share}"]`).getAttribute('data-comparison-precision');
        assert.ok(Math.abs(Number(value) - expected) < 1e-12, `${share}% comparison should show probability ${expected}, got ${value}`);
      };
      const baseline = await state();
      await noOverflow(true);
      assert.equal(await page.locator('#learnPanel').isVisible(), false);
      await activate('#learnToggle');
      assert.equal(await page.locator('#learnPanel').isVisible(), true);
      assert.equal(await page.locator('.metric-formula:visible').count(), 3);
      assert.deepEqual(await state(), baseline);
      await noOverflow();
      await activate('#tab-formulas');
      assert.ok((await page.locator('#calculation-tpr').textContent()).includes('480 ÷ (480 + 20) = 96%'));
      for (const [name, part, outcomes] of [
        ['tpr', 'numerator', ['tp']], ['tpr', 'denominator', ['tp', 'fn']],
        ['fpr', 'numerator', ['fp']], ['fpr', 'denominator', ['fp', 'tn']],
        ['precision', 'numerator', ['tp']], ['precision', 'denominator', ['tp', 'fp']]
      ]) {
        const term = `[data-explain="${name}"][data-part="${part}"]`;
        await activate(term);
        assert.equal(await page.locator(term).getAttribute('aria-pressed'), 'true');
        const included = await page.locator('.group:not(.metric-excluded)').evaluateAll(nodes => nodes.map(e => [...e.classList].find(c => ['tp','fp','fn','tn'].includes(c))));
        assert.deepEqual(included.sort(), outcomes.sort());
        assert.equal(await page.locator('.numerator-region').count(), part === 'numerator' ? 1 : 0);
        assert.equal(await page.locator('.denominator-region').count(), part === 'denominator' ? 1 : 0);
        assert.deepEqual(await state(), baseline);
        await activate(term);
        assert.equal(await page.locator('.metric-regions').count(), 0);
      }
      await activate('#tab-bayes');
      await activate('[data-learn-share="10"]');
      assert.equal(await page.locator('#prevalence').inputValue(), '10');
      assert.equal(await page.locator('#bayesPosterior').textContent(), '72.7%');
      assert.ok((await page.locator('#bayesCalculation').textContent()).includes('0.96 × 0.1'));
      assert.equal(await page.locator('#tpr').textContent(), '96%');
      assert.equal(await page.locator('#fpr').textContent(), '4%');
      await bayesEvidence(96, 36, 96 / 132);
      await comparisonProbability(10, 96 / 132);
      await comparisonProbability(50, 480 / 500);
      await activate('[data-learn-share="50"]');
      assert.equal(await page.locator('#bayesPosterior').textContent(), '96%');
      await bayesEvidence(480, 20, 480 / 500);
      await comparisonProbability(10, 96 / 132);
      await comparisonProbability(50, 480 / 500);
      const beforeMode = await state();
      await activate('#modeToggle');
      assert.deepEqual(await state(), beforeMode);
      assert.ok(!(await page.locator('#learnPanel').textContent()).includes('flu'));
      assert.ok((await page.locator('#learn-bayes').textContent()).includes('P(actual + | predicted +)'));
      for (const share of [0, 1, 10, 50, 99, 100]) {
        await setSlider('prevalence', share);
        for (const threshold of [0, 37, 50, 100]) {
          await setSlider('threshold', threshold);
          assert.equal(await page.locator('#bayesPosterior').textContent(), await page.locator('#precision').textContent());
          const text = await page.locator('#learnPanel').textContent();
          assert.ok(!/NaN|Infinity|undefined/.test(text));
          if (threshold === 100) {
            await bayesEvidence(0, 0, null);
            for (const comparisonShare of [10, 50]) {
              assert.equal(await page.locator(`[data-learn-share="${comparisonShare}"]`).getAttribute('data-comparison-precision'), 'na');
            }
          }
          await noOverflow();
        }
      }
      await activate('#reset');
      assert.equal(await page.locator('#learnPanel').isVisible(), true);
      assert.equal(await page.locator('#tab-bayes').getAttribute('aria-selected'), 'true');
      if (!device.mobile) {
        await page.locator('#tab-bayes').focus();
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.locator('#tab-formulas').getAttribute('aria-selected'), 'true');
        await page.keyboard.press('Home');
        assert.equal(await page.locator('#tab-basics').getAttribute('aria-selected'), 'true');
      }
      const beforeClose = await state();
      await activate('#closeLearn');
      assert.equal(await page.locator('#learnPanel').isVisible(), false);
      assert.deepEqual(await state(), beforeClose);
      assert.equal(await page.locator('#learnToggle').evaluate(e => e === document.activeElement), true);
      await noOverflow(true);
      assert.deepEqual(errors, []);
    } finally { await browser.close(); }
  });
}
