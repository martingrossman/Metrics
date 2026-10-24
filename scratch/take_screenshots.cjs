const { chromium, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const artifactDir = 'C:/Users/martin/.gemini/antigravity/brain/40594b13-638b-42d8-ad56-1584618d3d26';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('http://127.0.0.1:8080/');

  // 1. Standard layout screenshot
  await page.locator('#matrixLayoutSelect').selectOption('standard');
  await page.screenshot({ path: path.join(artifactDir, 'matrix_layout_standard.png') });

  // 2. Matches graph layout screenshot
  await page.locator('#matrixLayoutSelect').selectOption('graph');
  await page.screenshot({ path: path.join(artifactDir, 'matrix_layout_graph_aligned.png') });

  // 3. scikit-learn layout screenshot
  await page.locator('#matrixLayoutSelect').selectOption('scikit');
  await page.screenshot({ path: path.join(artifactDir, 'matrix_layout_scikit.png') });

  // Mobile WebKit screenshots
  const wk = await webkit.launch();
  const iphone = await wk.newPage({ viewport: { width: 402, height: 714 }, isMobile: true, hasTouch: true });
  await iphone.goto('http://127.0.0.1:8080/');

  // Find what buttons exist in the graph toggle group
  const tabButtons = await iphone.locator('.graph-tab').all();
  console.log('Graph tab count:', tabButtons.length);
  for (const btn of tabButtons) {
    const text = await btn.textContent();
    console.log('Tab text:', text);
    if (text.includes('4-Up')) {
      await btn.click();
      break;
    }
  }

  await iphone.screenshot({ path: path.join(artifactDir, 'webkit_iphone_4up_fullwidth.png') });

  // Switch back to Default (scores) and switch to 'Matches graph'
  for (const btn of tabButtons) {
    const text = await btn.textContent();
    if (text.includes('Default')) {
      await btn.click();
      break;
    }
  }
  await iphone.locator('#matrixLayoutSelect').selectOption('graph');
  await iphone.screenshot({ path: path.join(artifactDir, 'webkit_iphone_graph_layout.png') });

  await browser.close();
  await wk.close();
  console.log('Done screenshots!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
