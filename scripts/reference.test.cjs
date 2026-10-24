const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium, webkit } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

for (const device of [
  { name: 'desktop', browser: chromium, width: 1366, height: 768 },
  { name: 'small phone', browser: chromium, width: 320, height: 568 },
  { name: 'iPhone WebKit', browser: webkit, width: 390, height: 844 }
]) {
  test(`reference: ${device.name}`, { skip: !fs.existsSync(device.browser.executablePath()) }, async () => {
    const browser = await device.browser.launch();
    try {
      const page = await browser.newPage({ viewport: { width: device.width, height: device.height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../reference.html')).href);
      const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await noOverflow();
      assert.equal(await page.locator('.metric-detail').count(), 35);
      assert.equal(await page.locator('.metric-detail[open]').count(), 0);
      await page.locator('#fold-groups').click();
      assert.equal(await page.locator('.metric-detail:visible').count(), 0);
      await page.locator('[data-group="core"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.metric-detail:visible').count(), 8);
      await page.locator('.metric-detail summary').first().focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#metric-0').getAttribute('open'), '');

      // Search covers aliases, visible caveats, examples, and normalized Greek names.
      for (const [query, matches] of [['matthews',1], ['0.833',1], ['F-beta',1], ['software conventions',1]]) {
        await page.locator('#metricSearch').fill(query);
        assert.equal(await page.locator('.metric-detail:visible').count(), matches, query);
        assert.equal(await page.locator('.metric-detail[open]').count(), matches);
        assert.equal(await page.locator('.metric-section').count(), 1);
        await noOverflow();
      }
      await page.locator('#metricSearch').fill('');
      assert.equal(await page.locator('.metric-detail:visible').count(), 8);
      assert.equal(await page.locator('#metric-0').getAttribute('open'), '');
      await page.locator('#category').selectOption('ops');
      assert.equal(await page.locator('.metric-detail:visible').count(), 7);
      await page.locator('#metricSearch').fill('no such metric');
      assert.equal(await page.locator('.metric-section').count(), 0);
      assert.equal(await page.locator('#fold-details').isVisible(), false);
      await page.locator('#reset-filters').click();
      assert.equal(await page.locator('#metricSearch').evaluate(el => el === document.activeElement), true);
      await page.locator('#fold-details').click();
      assert.equal(await page.locator('.metric-detail[open]:visible').count(), 35);
      await noOverflow();
      assert.equal(await page.locator('.formula').evaluateAll(nodes => nodes.some(el => el.scrollWidth > el.clientWidth + 1)), false);
      await page.locator('#fold-details').click();
      await page.locator('#fold-groups').click();
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      assert.equal(await page.locator('.metric-detail[open]:visible').count(), 35);
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      assert.equal(await page.locator('.metric-detail:visible').count(), 0);

      await page.locator('#sec-guide summary').click();
      await noOverflow();
      await page.locator('#sec-guide summary').click();
      assert.equal(await page.locator('#calc-f1').textContent(), '76.2%');
      await page.locator('[data-metric="precision"]').click();
      assert.match(await page.locator('#calcFormulaBreakdown').textContent(), /32 \/ \(32 \+ 8\) = 80.0%/);
      await page.locator('#preset').selectOption('rare');
      assert.equal(await page.locator('#calc-precision').textContent(), '28.6%');
      await page.locator('#preset').selectOption('empty');
      for (const id of ['accuracy','f1','precision','recall','specificity','balancedAcc','mcc','fpr']) {
        assert.equal(await page.locator(`#calc-${id}`).textContent(), 'N/A');
      }
      assert.match(await page.locator('#calcFormulaBreakdown').textContent(), /denominator is zero/);
      await page.locator('#inTN').fill('100');
      assert.equal(await page.locator('#calc-accuracy').textContent(), '100.0%');
      assert.equal(await page.locator('#calc-recall').textContent(), 'N/A');
      assert.equal(await page.locator('#calc-specificity').textContent(), '100.0%');
      assert.equal(await page.locator('#calc-balancedAcc').textContent(), 'N/A');
      await page.locator('#inTP').fill('-1');
      assert.match(await page.locator('#input-error').textContent(), /positive whole number/);
      assert.equal(await page.locator('#calc-accuracy').textContent(), 'N/A');
      await page.locator('#inTP').fill('');
      assert.equal(await page.locator('#calc-accuracy').textContent(), 'N/A');
      await page.locator('#preset').selectOption('balanced');
      assert.equal(await page.locator('#calc-mcc').textContent(), '0.592');
      await page.locator('#preset').selectOption('automotive');
      assert.equal(await page.locator('#calc-recall').textContent(), '98.0%');
      assert.match(await page.locator('#scenario-context').textContent(), /AEB/);
      await page.locator('#scenario-context [data-scenario="aeb"]').click();
      assert.equal(await page.locator('#industry-examples').getAttribute('open'), '');
      assert.equal(await page.locator('#scenario-aeb').getAttribute('open'), '');
      assert.match(await page.locator('#scenario-aeb').textContent(), /6,000 hours/);
      assert.match(await page.locator('#scenario-aeb').textContent(), /10.8 false-positive frames/);
      assert.equal(await page.locator('.scenario-detail').count(), 8);
      assert.equal(await page.locator('.scenario-table').count(), 8);
      assert.equal(await page.locator('#scenario-factory .scenario-table tbody tr').count(), 2);
      assert.match(await page.locator('#scenario-factory .scenario-body').textContent(), /90.6% precision/);
      assert.match(await page.locator('#scenario-medical .scenario-body').textContent(), /593 positive results/);
      await page.reload();
      assert.equal(await page.locator('#scenario-aeb').getAttribute('open'), '');
      await noOverflow();
      await page.locator('#preset').selectOption('screening');
      assert.match(await page.locator('#scenario-context').textContent(), /Medical screening/);
      await page.locator('#inTP').fill('10');
      assert.equal(await page.locator('#scenario-context').isVisible(), false);
      // Comparison links open the requested explanation even when filters hid it.
      await page.locator('#metricSearch').fill('Precision');
      await page.locator('#metric-1 [data-related="17"]').click();
      assert.equal(await page.locator('#metricSearch').inputValue(), '');
      assert.equal(await page.locator('#metric-17').getAttribute('open'), '');
      assert.match(page.url(), /#metric-17$/);
      await page.reload();
      assert.equal(await page.locator('#metric-17').getAttribute('open'), '');
      assert.match(await page.locator('#metric-17 .metric-body').textContent(), /20% of alerts are wrong/);
      await noOverflow();
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
