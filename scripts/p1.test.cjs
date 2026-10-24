const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test('P1 features test', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);

    // Open Learn more panel
    await page.locator('#learnToggle').click();
    assert.equal(await page.locator('#learnPanel').isVisible(), true);

    // 1. Verify Tab 01 (Basics) - Accuracy & Accuracy Paradox
    const accuracyText = await page.locator('#liveAccuracy').textContent();
    assert.ok(accuracyText.includes('%'), `Accuracy should be formatted as percentage, got: ${accuracyText}`);

    // Click "Demo: Always predict Negative"
    await page.locator('#demoAlwaysNegative').click();
    const tprVal = await page.locator('#tpr').textContent();
    assert.equal(tprVal, '0%', 'Always negative should make TPR 0%');
    const accAfterDemo = await page.locator('#liveAccuracy').textContent();
    assert.ok(parseFloat(accAfterDemo) >= 90, `At p<=10%, accuracy should be >= 90%, got: ${accAfterDemo}`);

    // Click "Reset cutoff"
    await page.locator('#demoDefaultCutoff').click();
    assert.equal(await page.locator('#threshold').inputValue(), '50');

    // 2. Verify Tab 02 (Formulas) - Specificity, NPV, Miss Rate, F1
    await page.locator('#tab-formulas').click();
    assert.ok(await page.locator('#calculation-tnr').isVisible());
    assert.ok(await page.locator('#calculation-npv').isVisible());
    assert.ok(await page.locator('#calculation-fnr').isVisible());

    // Test highlighting for TNR
    await page.locator('[data-explain="tnr"][data-part="numerator"]').click();
    assert.equal(await page.locator('.numerator-region').count(), 1);
    await page.locator('[data-explain="tnr"][data-part="numerator"]').click(); // unpin

    // Test highlighting for NPV
    await page.locator('[data-explain="npv"][data-part="denominator"]').click();
    assert.equal(await page.locator('.denominator-region').count(), 1);
    await page.locator('[data-explain="npv"][data-part="denominator"]').click(); // unpin

    // Test F1 card
    const f1Text = await page.locator('.f1-score strong').textContent();
    assert.ok(!isNaN(parseFloat(f1Text)), `F1 score should be a number, got ${f1Text}`);

    // 3. Verify Tab 03 (Bayes) - Precision vs Prevalence curve
    await page.locator('#tab-bayes').click();
    assert.ok(await page.locator('.curve-svg[aria-label="Precision versus prevalence curve"]').isVisible());

    // 4. Verify Tab 04 (Trade-offs) - ROC curve, AUC, Cost scenarios
    await page.locator('#tab-tradeoffs').click();
    assert.ok(await page.locator('.auc-badge').isVisible());
    const aucText = await page.locator('.auc-badge strong').textContent();
    assert.ok(parseFloat(aucText) > 0.5, `AUC should be > 0.5, got: ${aucText}`);
    assert.ok(await page.locator('.curve-svg[aria-label="ROC curve: TPR versus FPR"]').isVisible());

    // Test Cost Scenarios
    await page.locator('[data-cost-scenario="screening"]').click();
    assert.equal(await page.locator('#threshold').inputValue(), '80');
    assert.ok(await page.locator('[data-cost-scenario="screening"]').evaluate(e => e.classList.contains('active')));

    await page.locator('[data-cost-scenario="conservative"]').click();
    assert.equal(await page.locator('#threshold').inputValue(), '20');
    assert.ok(await page.locator('[data-cost-scenario="conservative"]').evaluate(e => e.classList.contains('active')));

    await page.locator('[data-cost-scenario="balanced"]').click();
    assert.equal(await page.locator('#threshold').inputValue(), '50');
    assert.ok(await page.locator('[data-cost-scenario="balanced"]').evaluate(e => e.classList.contains('active')));

    // 5. Verify Learn Mode 4-Up Graph & Dashboard Advanced 4-Up View
    assert.equal(await page.locator('#learn-tradeoffs-body .four-up-container .curve-svg').count(), 4);

    await page.locator('#closeLearn').click();
    // Default view: Left = Scores (#plot), Right = Matrix (#matrixPanel)
    assert.ok(await page.locator('#plot').isVisible());
    assert.ok(await page.locator('#matrixPanel').isVisible());

    // Switch to Advanced 4-Up view: one big full-width 4-Up graph
    await page.locator('[data-graph-view="split"]').click();
    assert.equal(await page.locator('#matrixPanel').isVisible(), false);
    assert.ok(await page.locator('#plot').isVisible());
    assert.ok(await page.locator('#gaussPlot').isVisible());
    assert.ok(await page.locator('#rocPlot').isVisible());
    assert.ok(await page.locator('#prPlot').isVisible());
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true);

    await page.locator('#reset').click();
    assert.ok(await page.locator('#plot').isVisible());
    assert.ok(await page.locator('#matrixPanel').isVisible());

    // 6. Verify Real-World Domain Presets (Car Braking AEB and Spam Filter)
    await page.locator('#presetSelect').selectOption('car');
    assert.ok((await page.locator('#intro').textContent()).includes('emergency brakes'));
    assert.equal(await page.locator('#plot text').last().textContent(), 'Collision risk score →');
    assert.equal(await page.locator('#prevalence').inputValue(), '15');
    assert.equal(await page.locator('#presetSelect').inputValue(), 'car');

    await page.locator('#presetSelect').selectOption('spam');
    assert.ok((await page.locator('#intro').textContent()).includes('Spam folder'));
    assert.equal(await page.locator('#plot text').last().textContent(), 'Spam confidence score →');
    assert.equal(await page.locator('#presetSelect').inputValue(), 'spam');
    const spamDefaultPrec = await page.locator('#precision').textContent();
    assert.equal(spamDefaultPrec, '96.6%');
    // Moving spam portion changes precision (demonstrating base-rate fallacy)
    await page.locator('#prevalence').evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', {bubbles:true})); }, 10);
    const spamLowPrec = await page.locator('#precision').textContent();
    assert.equal(spamLowPrec, '82.7%');

    await page.locator('#reset').click();
    assert.equal(await page.locator('#plot text').last().textContent(), 'Flu test score →');
    assert.equal(await page.locator('#presetSelect').inputValue(), 'balanced');

  } finally {
    await browser.close();
  }
});
