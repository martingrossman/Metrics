async (page) => {
  const root = 'C:/Users/martin/Documents/GitHub/Metrics/test-results/';
  const out = {browser: page.context().browser().version(), tests: [], samples: [], errors: [], failedRequests: []};
  page.__qaErrors = page.__qaErrors || [];
  if (!page.__qaListening) {
    page.__qaListening = true;
    page.on('pageerror', e => page.__qaErrors.push({type:'pageerror', message:e.message}));
    page.on('console', m => {if (['error','warning'].includes(m.type())) page.__qaErrors.push({type:m.type(),message:m.text()});});
    page.on('requestfailed', r => page.__qaErrors.push({type:'requestfailed',url:r.url(),failure:r.failure()}));
    page.on('response', r => {if(r.status() >= 400) page.__qaErrors.push({type:'http',url:r.url(),status:r.status()});});
  }
  const check = (ok, detail) => {if (!ok) throw Error(typeof detail==='string'?detail:JSON.stringify(detail));};
  const test = async (id, name, fn) => {try {out.tests.push({id,name,status:'PASS',evidence:await fn()});} catch(e) {out.tests.push({id,name,status:'FAIL',error:e.message});}};
  const set = async (id,v) => page.locator('#'+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},v);
  const read = () => page.evaluate(() => {
    const counts = Object.fromEntries(['tp','fp','fn','tn'].map(k=>[k,Number(document.getElementById(k+'Num').title.match(/[\d.]+/)[0])]));
    const markerCounts = Object.fromEntries(['tp','fp','fn','tn'].map(k=>[k,[...document.querySelectorAll('#'+k+'Tiles .tile')].reduce((s,e)=>s+Number(e.title.split(' · ')[1].match(/[\d.]+/)[0]),0)]));
    const pointCounts = Object.fromEntries(['tp','fp','fn','tn'].map(k=>[k,[...document.querySelectorAll('#plot .point[data-outcome='+k+']')].reduce((s,e)=>s+Number(e.querySelector('title').textContent.split(' · ')[1].match(/[\d.]+/)[0]),0)]));
    return {counts,markerCounts,pointCounts,metrics:Object.fromEntries(['tpr','fpr','precision'].map(k=>[k,document.getElementById(k).textContent.trim()])),values:['threshold','separation','prevalence'].map(k=>Number(document.getElementById(k).value)),preset:document.getElementById('presetSelect').value,summary:document.getElementById('summary').textContent,layout:document.getElementById('matrixLayoutBtn').dataset.layout,mode:document.querySelector('[role=tab][aria-selected=true]').dataset.graphView};
  });
  const close=(a,b,tol=1e-7)=>check(Math.abs(a-b)<=tol,{actual:a,expected:b,tol});
  const rate=(text,expected)=>{if(!Number.isFinite(expected)) check(text==='N/A',{text,expected:'N/A'});else close(parseFloat(text)/100,expected,0.00051);};
  await page.setViewportSize({width:1440,height:900});
  await page.goto('http://localhost:8080/');
  await test('F01','Five scenario presets and domain terminology',async()=>{
    const states=[];
    for(const p of ['balanced','car','spam','fraud','generic']) {await page.locator('#presetSelect').selectOption(p);const s=await read();states.push({p,...s,labels:await page.locator('#intro,#shareLabel,#thresholdLabel').allTextContents()});check(s.preset===p,s);close(Object.values(s.counts).reduce((a,b)=>a+b),1000);}
    return states;
  });
  await test('F02','Native range keyboard control and Custom state',async()=>{
    await page.locator('#presetSelect').selectOption('car');await page.locator('#threshold').focus();await page.keyboard.press('ArrowRight');const s=await read();check(s.preset==='custom',s);return {s,custom:await page.locator('#presetSelect option:checked').textContent()};
  });
  await test('F03','10%/50% controls preserve separation and threshold',async()=>{
    await page.locator('#reset').click();await page.locator('#balance50').click();const a=await read();await page.locator('#balance10').click();const b=await read();check(a.values[0]===b.values[0]&&a.values[1]===b.values[1],{a,b});check(a.values[2]===50&&b.values[2]===10,{a,b});check(a.metrics.tpr===b.metrics.tpr&&a.metrics.fpr===b.metrics.fpr,{a,b});return {a,b};
  });
  await test('M01','Independent weighted counts, rates, marker totals; 105 rendered states',async()=>{
    await page.locator('#presetSelect').selectOption('generic');
    for(const sep of [0,60,100]) for(const prev of [0,1,10,37,50,99,100]) for(const cutoff of [0,25,50,75,100]) {
      await set('separation',sep);await set('prevalence',prev);await set('threshold',cutoff);const s=await read();const {tp,fp,fn,tn}=s.counts;
      close(tp+fp+fn+tn,1000);close(tp+fn,prev*10);close(fp+tn,1000-prev*10);
      rate(s.metrics.tpr,tp+fn?tp/(tp+fn):NaN);rate(s.metrics.fpr,fp+tn?fp/(fp+tn):NaN);rate(s.metrics.precision,tp+fp?tp/(tp+fp):NaN);
      for(const k of ['tp','fp','fn','tn']) {close(s.markerCounts[k],s.counts[k]);close(s.pointCounts[k],s.counts[k]);}
      if(sep===100&&cutoff===50)close(fp+fn,0);
      out.samples.push({sep,prev,cutoff,...s});
    }
    return {renderedStates:out.samples.length,tolerance:'counts 1e-7; displayed rates 0.051 percentage points'};
  });
  await test('M02','Threshold monotonicity with conventional positive-score cutoff',async()=>{
    await page.locator('#presetSelect').selectOption('generic');await set('prevalence',37);await set('separation',60);const rows=[];let last={tpr:1,fpr:1};
    for(let v=0;v<=100;v+=5) {await set('threshold',v);const s=await read();const tpr=s.counts.tp/(s.counts.tp+s.counts.fn),fpr=s.counts.fp/(s.counts.fp+s.counts.tn);check(tpr<=last.tpr+1e-9&&fpr<=last.fpr+1e-9,{v,last,tpr,fpr});last={tpr,fpr};rows.push({v,...last});}return rows;
  });
  await test('M03','Rare-event base-rate invariance and precision',async()=>{
    await page.locator('#reset').click();const rows=[];for(const p of [1,10,50,99]){await set('prevalence',p);const s=await read();check(s.metrics.tpr==='96%'&&s.metrics.fpr==='4%',s);rate(s.metrics.precision,(0.96*p)/(0.96*p+0.04*(100-p)));rows.push(s);}return rows;
  });
  await test('F04','Three matrix layouts preserve model and highlights',async()=>{
    await page.locator('#reset').click();await page.locator('#precisionCard').click();await page.mouse.move(0,0);const states=[];let original=await read();
    for(let i=0;i<3;i++){await page.locator('#matrixLayoutBtn').click();const s=await read();check(JSON.stringify(s.counts)===JSON.stringify(original.counts),s);const h=await page.evaluate(()=>({included:[...document.querySelectorAll('#matrixPopulation .group:not(.metric-excluded)')].map(e=>e.className),num:getComputedStyle(document.getElementById('matrixNumerator')).gridArea,den:getComputedStyle(document.getElementById('matrixDenominator')).gridArea}));check(h.included.length===2&&h.included.some(x=>x.includes('tp'))&&h.included.some(x=>x.includes('fp')),h);states.push({s,h});}return states;
  });
  await test('F05','Six graph modes preserve model and valid SVG coordinates',async()=>{
    await page.locator('#reset').click();const initial=await read();const rows=[];for(const id of ['tabGraphScores','tabGraphSplit','tabGraphGauss','tabGraphRoc','tabGraphPr','tabGraphBayes']) {await page.locator('#'+id).click();const s=await read();check(JSON.stringify(s.counts)===JSON.stringify(initial.counts),s);const bad=await page.locator('svg [d],svg [cx],svg [x]').evaluateAll(es=>es.filter(e=>[...e.attributes].some(a=>/NaN|Infinity/.test(a.value))).map(e=>e.outerHTML));check(!bad.length,bad);rows.push({id,s});}return rows;
  });
  await test('F06','Hover/focus/Enter pin/Escape clear for three metrics',async()=>{
    await page.locator('#tabGraphScores').click();const rows=[];
    for(const [id,expected] of [['tpr',['tp','fn']],['fpr',['fp','tn']],['precision',['tp','fp']]]){
      await page.locator('#'+id+'Card').hover();const included=await page.locator('#matrixPopulation .group:not(.metric-excluded)').evaluateAll(es=>es.map(e=>['tp','fp','fn','tn'].find(k=>e.classList.contains(k))).sort());check(JSON.stringify(included)===JSON.stringify(expected.sort()),{id,included});
      await page.mouse.move(0,0);await page.locator('#'+id+'Card').focus();await page.keyboard.press('Enter');check(await page.locator('#'+id+'Card').getAttribute('aria-pressed')==='true',id);await page.keyboard.press('Escape');check(await page.locator('#'+id+'Card').getAttribute('aria-pressed')==='false',id);rows.push({id,included});}return rows;
  });
  await test('F07','Matching dot/tile hover links',async()=>{
    await page.locator('#reset').click();const dot=page.locator('#plot .point').first();const id=await dot.getAttribute('data-id');await dot.hover();const square=await page.locator('.tile[data-id="'+id+'"]').getAttribute('class');check(square.includes('focus'),square);await page.locator('.tile[data-id="'+id+'"]').hover();const circle=await page.locator('#plot .point[data-id="'+id+'"]').getAttribute('class');check(circle.includes('focus'),circle);return {id,square,circle};
  });
  await test('F08','Threshold mouse drag, pointer capture and clamp beyond graph',async()=>{
    await page.locator('#reset').click();let b=await page.locator('#plot .threshold-drag').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(1439,899,{steps:20});const held=await read();await page.mouse.up();check(held.values[0]===0,held);b=await page.locator('#plot .threshold-drag').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(0,0,{steps:20});await page.mouse.up();const left=await read();check(left.values[0]===100,left);return {right:held,left};
  });
  await test('F09','Graph slider keyboard Home/End/Arrow/Page keys',async()=>{
    await page.locator('#reset').click();await page.locator('#plot').focus();const rows=[];for(const key of ['Home','End','ArrowLeft','ArrowRight','PageDown','PageUp']){await page.keyboard.press(key);rows.push({key,s:await read()});}check(rows[0].s.values[0]===100&&rows[1].s.values[0]===0,rows);return rows;
  });
  await test('F10','Group drag changes separation and prevalence on long vertical gesture',async()=>{
    await page.locator('#reset').click();const b=await page.locator('#plot .point').first().boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+100,b.y-120,{steps:20});await page.mouse.up();const s=await read();check(s.values[1]!==60||s.values[2]!==10,s);return s;
  });
  await test('F11','Repeated resets clear state and highlighted metric',async()=>{
    const rows=[];for(let i=0;i<3;i++){await page.locator('#reset').click();const s=await read();check(JSON.stringify(s.values)==='[50,60,10]'&&s.preset==='balanced',s);check(await page.locator('.metric[aria-pressed=true]').count()===0,s);rows.push(s);}return rows;
  });
  await test('F12','Refresh behavior (observation; persistence not promised)',async()=>{
    await page.locator('#matrixLayoutBtn').click();await set('threshold',73);await page.locator('#tabGraphSplit').click();const before=await read();await page.reload();return {before,after:await read(),note:'Returns to defaults; no documented persistence feature.'};
  });
  await test('F13','Dashboard panel drag/resize feature discovery',async()=>{
    const before=await page.locator('#matrixPanel').boundingBox();await page.mouse.move(before.x+10,before.y+10);await page.mouse.down();await page.mouse.move(before.x-80,before.y+80,{steps:10});await page.mouse.up();await page.mouse.move(before.x+before.width-2,before.y+before.height-2);await page.mouse.down();await page.mouse.move(before.x+before.width-70,before.y+before.height-40,{steps:10});await page.mouse.up();return {status:'NOT IMPLEMENTED',before,after:await page.locator('#matrixPanel').boundingBox(),note:'Data markers are not draggable dashboard widgets; resizing/reordering absent.'};
  });
  await page.locator('#reset').click();
  await page.screenshot({path:root+'screenshots/chromium-desktop-default.png',fullPage:true});
  out.errors=page.__qaErrors;
  return out;
}
