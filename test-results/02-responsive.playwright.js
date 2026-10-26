async (page) => {
  const root='C:/Users/martin/Documents/GitHub/Metrics/test-results/';
  const sizes=[[320,568],[375,667],[390,844],[402,874],[430,932],[360,800],[412,915],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[2560,1440],[1440,500],[800,400]];
  const out={browser:page.context().browser().version(),rows:[],zoom:[]};
  const measure=()=>page.evaluate(()=>{
    const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    const controls=[...document.querySelectorAll('button,input,select,a,[role=slider]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,text:(e.getAttribute('aria-label')||e.innerText||e.id).slice(0,90),box:box(e),font:getComputedStyle(e).fontSize,outline:getComputedStyle(e).outline}));
    const svgClips=[];for(const s of document.querySelectorAll('svg.plot')) {if(!s.getBoundingClientRect().width)continue; const vb=s.viewBox.baseVal;for(const t of s.querySelectorAll('text')){const b=t.getBoundingClientRect(),sb=s.getBoundingClientRect();if(b.width&& (b.x<sb.x-2||b.right>sb.right+2||b.y<sb.y-2||b.bottom>sb.bottom+2))svgClips.push({svg:s.id,text:t.textContent,box:box(t),svgBox:box(s)});}}
    return {viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],main:box(document.querySelector('main')),horizontal:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,controls,outside:controls.filter(c=>c.box.x<0||c.box.right>innerWidth+1||c.box.y<0||c.box.bottom>innerHeight+1),svgClips,smallTargets:controls.filter(c=>c.box.w<44||c.box.h<44).map(c=>({id:c.id,box:c.box})),mode:document.querySelector('[role=tab][aria-selected=true]').dataset.graphView};
  });
  for(const [w,h] of sizes){
    await page.setViewportSize({width:w,height:h});await page.goto('http://localhost:8080/');const modes=[];
    for(const [id,mode] of [['tabGraphScores','default'],['tabGraphSplit','4up'],['tabGraphGauss','gauss'],['tabGraphRoc','roc'],['tabGraphPr','pr'],['tabGraphBayes','bayes']]){
      await page.locator('#'+id).click();const m=await measure();
      if(['default','4up'].includes(mode)) {m.screenshot='screenshots/chromium-'+w+'x'+h+'-'+mode+'.png';await page.screenshot({path:root+m.screenshot,fullPage:true});}
      // Confirm a visible top control remains usable after each view change.
      await page.locator('#threshold').focus();const old=Number(await page.locator('#threshold').inputValue());await page.keyboard.press('ArrowRight');m.keyboardUsable=Number(await page.locator('#threshold').inputValue())===Math.min(100,old+1);
      await page.locator('#threshold').press('ArrowLeft');modes.push(m);
    }
    out.rows.push({w,h,modes});
  }
  await page.setViewportSize({width:1440,height:900});await page.goto('http://localhost:8080/');
  const before=await page.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth}));await page.keyboard.press('Control++');const after=await page.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth}));await page.keyboard.press('Control+0');out.nativeZoom={before,after,status:before.dpr===after.dpr&&before.width===after.width?'BLOCKED':'EXECUTED',note:'Headless browser shortcut did not change native zoom; CSS zoom below is supplemental, not native browser zoom.'};
  for(const z of [1.25,1.5,2]){await page.evaluate(z=>document.body.style.zoom=String(z),z);await page.locator('#tabGraphScores').click();const m=await measure();m.factor=z;m.method='CSS body zoom; native zoom remains blocked';m.screenshot='screenshots/chromium-css-zoom-'+z+'.png';await page.screenshot({path:root+m.screenshot,fullPage:true});out.zoom.push(m);}
  await page.evaluate(()=>document.body.style.zoom='');await page.reload();
  out.errors=page.__qaErrors||[];return out;
}
