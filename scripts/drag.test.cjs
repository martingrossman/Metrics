const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');
const { runInNewContext } = require('node:vm');

// Read the app's settings so tuning sensitivity does not require duplicate edits here.
const dragSettings = runInNewContext('(' + fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
  .match(/const GROUP_DRAG = Object\.freeze\((\{[\s\S]*?\})\);/)[1] + ')');

const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

for (const device of [
  { name: 'desktop mouse', engine: chromium, viewport: { width: 1440, height: 900 } },
  { name: 'Android touch', engine: chromium, viewport: { width: 412, height: 915 }, touch: true },
  { name: 'iPhone-size touch', engine: chromium, viewport: { width: 402, height: 714 }, touch: true },
  { name: 'WebKit mobile pointer', engine: webkit, viewport: { width: 402, height: 714 }, mobile: true }
]) {
  test(`graph threshold: ${device.name}`, {
    skip: !fs.existsSync(device.engine.executablePath()) && `${device.engine.name()} is not installed`
  }, async () => {
    const browser = await device.engine.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: device.viewport, isMobile: Boolean(device.touch || device.mobile),
        hasTouch: Boolean(device.touch || device.mobile), reducedMotion: 'reduce'
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      assert.equal(await page.locator('label[for="presetSelect"]').textContent(), 'Try an example');
      assert.equal(await page.locator('label[for="presetSelect"]').isVisible(), true);
      assert.equal(await page.locator('#presetSelect').inputValue(), 'balanced');
      assert.equal(await page.locator('#prevalence').inputValue(), '10');
      assert.equal(await page.locator('#balance10').getAttribute('aria-pressed'), 'true');
      assert.deepEqual(await page.locator('#presetSelect option:not([disabled])').allTextContents(),
        ['Medical test', 'Car braking', 'Spam filter', 'Fraud detection', 'Generic ML']);
      const cdp = device.touch ? await page.context().newCDPSession(page) : null;
      const point = fraction => page.evaluate(fraction => {
        const plot = document.getElementById('plot');
        const grip = plot.querySelector('.threshold-grip');
        const p = plot.createSVGPoint();
        p.x = fraction === null ? Number(grip.getAttribute('x')) + Number(grip.getAttribute('width')) / 2 : 190 + fraction * 410;
        p.y = Number(grip.getAttribute('y')) + Number(grip.getAttribute('height')) / 2;
        const screen = p.matrixTransform(plot.getScreenCTM());
        return { x: screen.x, y: screen.y };
      }, fraction);
      const input = async (type, p) => {
        if (cdp) {
          await cdp.send('Input.dispatchTouchEvent', {
            type, touchPoints: ['touchEnd', 'touchCancel'].includes(type) ? [] : [{ ...p, id: 0 }]
          });
        } else if (type === 'touchStart') {
          await page.mouse.move(p.x, p.y);
          await page.mouse.down();
        } else if (type === 'touchMove') {
          await page.mouse.move(p.x, p.y, { steps: 4 });
        } else {
          await page.mouse.up();
        }
      };
      const check = async (cutoff, generic = false) => {
        // Touch moves are delivered on the browser's next animation frame.
        await page.waitForFunction(value => document.getElementById('plot').getAttribute('aria-valuenow') === String(value), cutoff);
        assert.equal(await page.locator('#threshold').inputValue(), String(generic ? cutoff : 100 - cutoff));
        assert.equal(await page.locator('#plot').getAttribute('aria-valuenow'), String(cutoff));
        assert.equal(await page.locator('#prevalence').inputValue(), generic ? '50' : '10');
        assert.equal(await page.locator('#separation').inputValue(), '60');
      };
      const state = () => page.locator('#tpr, #fpr, #precision, #tpNum, #fpNum, #fnNum, #tnNum').allTextContents();
      const geometry = await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
      const baseline = await state();

      // Capture survives repeated redraws and moving beyond the line's hit area.
      await input('touchStart', await point(null));
      for (const cutoff of [25, 75, 20]) {
        await input('touchMove', await point(cutoff / 100));
        await check(cutoff);
      }
      assert.notDeepEqual(await state(), baseline);
      const draggedState = await state();
      await input('touchEnd');
      assert.equal(await page.locator('#plot').evaluate(e => e.classList.contains('dragging')), false);
      await page.locator('#threshold').evaluate(e => {
        e.value = '80';
        e.dispatchEvent(new Event('input', { bubbles: true }));
      });
      assert.deepEqual(await state(), draggedState);

      // Clamp at either edge, even when a captured pointer leaves the plot.
      await input('touchStart', await point(null));
      await input('touchMove', await point(-0.1));
      await check(0);
      await input('touchMove', await point(1.1));
      await check(100);
      await input('touchEnd');
      await page.locator('#reset').click();

      // A grab near the line must not jump the threshold on pointerdown.
      const near = await point(null);
      near.x += 14;
      near.y += 28;
      await input('touchStart', near);
      await check(50);
      const to = await point(0.65);
      await input('touchMove', { x: to.x + 14, y: near.y });
      await check(65);
      await input(device.touch ? 'touchCancel' : 'touchEnd');
      assert.equal(await page.locator('#plot').evaluate(e => e.classList.contains('dragging')), false);

      await page.locator('#presetSelect').selectOption('generic');
      await check(50, true);
      await input('touchStart', await point(null));
      await input('touchMove', await point(0.4));
      await input('touchEnd');
      await check(40, true);
      await page.locator('#presetSelect').selectOption('balanced');
      await check(50);

      await page.locator('#plot').focus();
      for (const [key, cutoff] of [['ArrowRight', 51], ['ArrowLeft', 50], ['Home', 0], ['End', 100]]) {
        await page.keyboard.press(key);
        await check(cutoff);
        assert.equal(await page.locator('#plot').evaluate(e => e === document.activeElement), true);
      }
      // Drag either group in both score layouts; use real touch gestures on Chromium phones.
      for(const view of ['scores','split']) {
        await page.locator(`[data-graph-view="${view}"]`).click();
        for(const direction of [1,-1]) {
          await page.locator('#separation').evaluate(e=>{e.value='60';e.dispatchEvent(new Event('input'));});
          const groupPoint=()=>page.locator(`#plot circle.point[data-separation-direction="${direction}"]`).evaluateAll((nodes,direction)=>{
            // Grab a real dot near the group center, away from the cutoff hit target.
            const split=nodes[0].ownerSVGElement.viewBox.baseVal.height===270;
            const mean=(split?155:190)+(split?475:410)*(0.5+direction*0.18);
            const e=nodes.reduce((best,node)=>Math.abs(Number(node.getAttribute('cx'))-mean)<Math.abs(Number(best.getAttribute('cx'))-mean)?node:best);
            const svg=e.ownerSVGElement, p=svg.createSVGPoint();
            p.x=Number(e.getAttribute('cx'));
            p.y=Number(e.getAttribute('cy'));
            const screen=p.matrixTransform(svg.getScreenCTM());
            return {x:screen.x,y:screen.y,scale:svg.getScreenCTM().a};
          }, direction);
          const start=await groupPoint();
          const width=view==='split'?475:410;
          const threshold=await page.locator('#threshold').inputValue();
          await input('touchStart',{x:start.x,y:start.y});
          assert.equal(await page.locator('#separation').inputValue(),'60','No jump on grab');
          await input('touchMove',{x:start.x+30,y:start.y});
          await page.waitForFunction(()=>Number(document.getElementById('separation').value)>60);
          const fineChange=Number(await page.locator('#separation').inputValue())-60;
          assert.ok(fineChange<=5,'Short horizontal drags give fine control');
          await input('touchMove',{x:start.x+90,y:start.y});
          await page.waitForFunction(change=>Number(document.getElementById('separation').value)-60>change*3,fineChange);
          for(const separation of [80,20,100,0,60]) {
            const target=separation===100?110:separation===0?-10:separation;
            const change=(target-60)/100;
            const distance=Math.sign(change)*Math.pow(Math.abs(change),1/dragSettings.responseExponent)
              *Math.max(dragSettings.minDistancePixels,width*start.scale*dragSettings.horizontalWidthScale);
            await input('touchMove',{x:start.x+distance,y:start.y});
            // Native pointer coordinates can round by a screen pixel in WebKit.
            await page.waitForFunction(value=>Math.abs(Number(document.getElementById('separation').value)-value)<=2,separation);
            const actual=Number(await page.locator('#separation').inputValue());
            if(separation===0 || separation===100) assert.equal(actual,separation);
            assert.equal(await page.locator('#separationOut').textContent(),`${actual}%`);
            assert.equal(await page.locator('#threshold').inputValue(),threshold);
            assert.equal(await page.locator('#prevalence').inputValue(),'10');
          }
          await input('touchEnd');
          assert.equal(await page.locator('#plot').evaluate(e=>e.classList.contains('dragging')),false);
          await page.locator('#prevalence').evaluate(e=>{e.value='50';e.dispatchEvent(new Event('input'));});
          const verticalStart=await groupPoint();
          const separationBefore=await page.locator('#separation').inputValue();
          await input('touchStart',{x:verticalStart.x,y:verticalStart.y});
          // A small sideways lead-in must not permanently block a deliberate vertical mouse drag.
          if(!device.touch && !device.mobile) await input('touchMove',{x:verticalStart.x+8,y:verticalStart.y});
          await input('touchMove',{x:verticalStart.x,y:verticalStart.y-30});
          await page.waitForFunction(()=>Number(document.getElementById('prevalence').value)>50,null,{timeout:3000});
          const share=await page.locator('#prevalence').inputValue();
          assert.ok(Math.abs(Number(share)-50)<=5,'A short vertical drag changes the share gently');
          assert.equal(await page.locator('#separation').inputValue(),separationBefore);
          // Once a vertical gesture starts, sideways movement must not alter separation.
          await input('touchMove',{x:verticalStart.x+30,y:verticalStart.y-30});
          assert.equal(await page.locator('#prevalence').inputValue(),share);
          assert.equal(await page.locator('#separation').inputValue(),separationBefore);
          await input('touchMove',{x:verticalStart.x,y:verticalStart.y-90});
          await page.waitForFunction(share=>Number(document.getElementById('prevalence').value)>Number(share),share,{timeout:3000}).catch(async error=>{
            throw new Error(`${view}, group ${direction}, initial change ${share}, current ${await page.locator('#prevalence').inputValue()}, dragging ${await page.locator('#plot').getAttribute('class')}: ${error.message}`);
          });
          const largerChange=Math.abs(Number(await page.locator('#prevalence').inputValue())-50);
          assert.ok(largerChange>Math.abs(Number(share)-50)*3,'Longer vertical drags accelerate');
          await input('touchMove',{x:verticalStart.x,y:verticalStart.y+30});
          await page.waitForFunction(()=>Number(document.getElementById('prevalence').value)<50);
          assert.equal(await page.locator('#separation').inputValue(),separationBefore);
          await input('touchEnd');
          await page.locator('#prevalence').evaluate(e=>{e.value='10';e.dispatchEvent(new Event('input'));});
        }
      }
      await page.locator('#reset').click();
      assert.deepEqual(await page.locator('.panel').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height)), geometry);
      assert.equal(await page.evaluate(() => scrollY), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (device.touch || device.mobile) {
        assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), false);
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  });
}
