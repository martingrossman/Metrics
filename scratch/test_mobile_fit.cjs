const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 402, height: 714 } });
  await page.goto('http://127.0.0.1:8080/');

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'test-style';
    style.innerHTML = `
      @media (max-width: 650px) and (orientation: portrait) {
        .metric-label small {
          display: block !important;
          font-size: 8.5px !important;
          line-height: 1.05 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .metric {
          padding: 3px 6px 2px !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 1px !important;
        }
        .metric strong {
          font-size: 19px !important;
          line-height: 1 !important;
        }
        .control, .control input[type="range"] {
          min-height: 28px !important;
          height: 28px !important;
        }
      }
    `;
    document.head.appendChild(style);
  });
  let h = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    overflow: document.documentElement.scrollHeight > window.innerHeight
  }));
  console.log('Test result:', h);

  await page.screenshot({ path: 'C:/Users/martin/.gemini/antigravity/brain/40594b13-638b-42d8-ad56-1584618d3d26/test_mobile_with_captions.png' });
  await browser.close();
})();
