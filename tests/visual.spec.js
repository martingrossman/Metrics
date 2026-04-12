const path = require('node:path');
const { test, expect } = require('playwright/test');

async function disableMotion(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
      }
    `
  });
}

async function waitForAppReady(page) {
  await page.waitForFunction(() => {
    const auc = document.getElementById('m_auc');
    const tp = document.querySelector('#cm_tp .count');
    const presetButtons = document.querySelectorAll('#desktopPresetStrip button');
    const rocSvg = document.querySelector('#rocPlot .main-svg, #rocPlot canvas');
    const distSvg = document.querySelector('#distPlot .main-svg, #distPlot canvas');
    return Boolean(
      auc &&
      auc.textContent &&
      auc.textContent.trim() !== '—' &&
      tp &&
      tp.textContent &&
      tp.textContent.trim() !== '—' &&
      presetButtons.length > 0 &&
      rocSvg &&
      distSvg
    );
  });
}

async function gotoApp(page) {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await disableMotion(page);
  await waitForAppReady(page);
}

test.describe('visual regression', () => {
  test('desktop default app shell', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1900 });
    await gotoApp(page);
    await expect(page).toHaveScreenshot('desktop-default.png', { fullPage: true });
  });

  test('desktop custom-data state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1900 });
    await gotoApp(page);

    await page.locator('#customDataToggleBtn').click();
    await page.locator('#file_custom_data').setInputFiles(path.resolve(__dirname, '..', 'sample_data.csv'));
    await page.waitForFunction(() => {
      const status = document.getElementById('dataStatus');
      return status && status.textContent.includes('Loaded');
    });
    await page.locator('#btn_cm').click();

    await expect(page).toHaveScreenshot('desktop-custom-data.png', { fullPage: true });
  });

  test('mobile default layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await gotoApp(page);
    await expect(page).toHaveScreenshot('mobile-default.png', { fullPage: true });
  });
});
