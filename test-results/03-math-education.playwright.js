async(page)=>{
 const root='C:/Users/martin/Documents/GitHub/Metrics/test-results/';const out={tests:[],calculations:[],learning:[],curves:[],observations:[]};
 const check=(ok,e)=>{if(!ok)throw Error(typeof e==='string'?e:JSON.stringify(e));};const close=(a,b,t=0.00051)=>check(Math.abs(a-b)<=t,{actual:a,expected:b,t});
 const test=async(id,name,fn)=>{try{out.tests.push({id,name,status:'PASS',evidence:await fn()});}catch(e){out.tests.push({id,name,status:'FAIL',error:e.message});}};
 const set=async(id,v)=>page.locator('#'+id).evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},v);
 const expected=([tp,fp,fn,tn])=>{const div=(a,b)=>b?a/b:null;return {accuracy:div(tp+tn,tp+fp+fn+tn),precision:div(tp,tp+fp),recall:div(tp,tp+fn),specificity:div(tn,tn+fp),fpr:div(fp,fp+tn),fnr:div(fn,tp+fn),npv:div(tn,tn+fn),f1:div(2*tp,2*tp+fp+fn),balancedAcc:(tp+fn)&&(tn+fp)?(tp/(tp+fn)+tn/(tn+fp))/2:null,mcc:div(tp*tn-fp*fn,Math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn)))};};
 await page.setViewportSize({width:1440,height:900});await page.goto('http://localhost:8080/reference.html#sec-calculator');
 await test('M04','Reference calculator independently validates eight metrics on ten count sets',async()=>{
  for(const c of [[32,8,12,48],[8,20,2,970],[98,90,2,810],[50,1,50,899],[98,10,2,890],[0,0,0,0],[0,0,10,990],[0,10,10,980],[10,0,0,990],[0,1,1,0]]){
   for(const [i,id] of ['inTP','inFP','inFN','inTN'].entries())await page.locator('#'+id).fill(String(c[i]));
   const actual=await page.locator('#calc-metrics .value').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.id.replace('calc-',''),e.textContent])));const exp=expected(c);
   for(const [k,text] of Object.entries(actual)){if(exp[k]===null)check(text==='N/A',{c,k,text,expected:null});else close(Number(text.replace('%',''))/(k==='mcc'?1:100),exp[k],k==='mcc'?0.00051:0.000501);}
   out.calculations.push({counts:c,expected:exp,actual});
  }return {countSets:out.calculations.length,metrics:8};
 });
 await test('F14','Reference calculator preset selection, metric selection, invalid inputs',async()=>{
  const rows=[];for(const p of ['balanced','rare','screening','precise','automotive','empty']){await page.locator('#preset').selectOption(p);rows.push({p,total:await page.locator('#lblTotal').textContent(),metrics:await page.locator('#calc-metrics').innerText()});}
  for(const m of ['accuracy','f1','precision','recall','specificity','balancedAcc','mcc','fpr']){await page.locator('#calc-metrics [data-metric='+m+']').click();check(await page.locator('#calc-metrics [data-metric='+m+']').getAttribute('aria-pressed')==='true',m);}
  for(const v of ['-1','1.5','','9007199254740992']){await page.locator('#inTP').fill(v);const error=await page.locator('#input-error').textContent();check(error.length>0,{v,error});check(await page.locator('#calc-accuracy').textContent()==='N/A',v);rows.push({v,error});}await page.locator('#preset').selectOption('balanced');return rows;
 });
 await page.screenshot({path:root+'screenshots/reference-calculator.png',fullPage:true});
 await page.goto('http://localhost:8080/learn.html');
 await test('E01','All four learning tabs, terminology toggle, and live content',async()=>{
  const rows=[];for(const tab of ['basics','formulas','bayes','tradeoffs']){await page.locator('#tab-'+tab).click();const text=await page.locator('#learn-'+tab).innerText();check(text.length>150,{tab,text});rows.push({tab,text});}
  await page.locator('#modeToggle').click();const label=await page.locator('#modeToggle').getAttribute('aria-label');await page.locator('#modeToggle').click();out.learning.push(...rows);return {tabs:rows.map(x=>x.tab),toggle:label};
 });
 await test('M05','Learn formula values for TPR/FPR/PPV/TNR/NPV/FNR/Accuracy/F1',async()=>{
  await page.locator('#tab-formulas').click();await set('prevalence',37);await set('threshold',50);await set('separation',60);
  const counts=await page.locator('#tpNum,#fpNum,#fnNum,#tnNum').allTextContents();const c=[Number(counts[0]),Number(counts[2]),Number(counts[1]),Number(counts[3])];const exp=expected(c);const actual={};
  for(const [k,id] of [['recall','tpr'],['fpr','fpr'],['precision','precision'],['specificity','tnr'],['npv','npv'],['fnr','fnr'],['accuracy','accuracy']]){const txt=await page.locator('#calculation-'+id).textContent();actual[k]=txt;const match=txt.match(/=\s*([\d.]+)%/);check(match,{k,txt});close(Number(match[1])/100,exp[k]);}
  actual.f1=await page.locator('.f1-score strong').textContent();close(Number(actual.f1),exp.f1);out.calculations.push({context:'learn',counts:c,expected:exp,actual});return out.calculations.at(-1);
 });
 await test('E02','Formula numerator/denominator buttons highlight correct outcomes',async()=>{
  const rows=[];const def={tpr:['tp',['tp','fn']],fpr:['fp',['fp','tn']],precision:['tp',['tp','fp']],tnr:['tn',['tn','fp']],npv:['tn',['tn','fn']],fnr:['fn',['tp','fn']]};
  for(const [name,[num,den]] of Object.entries(def))for(const part of ['numerator','denominator']){const sel='[data-explain='+name+'][data-part='+part+']';await page.locator(sel).click();await page.mouse.move(0,0);const included=await page.locator('#matrixPanel .group:not(.metric-excluded)').evaluateAll(es=>es.map(e=>['tp','fp','fn','tn'].find(x=>e.classList.contains(x))).sort());const exp=part==='numerator'?[num]:den.sort();check(JSON.stringify(included)===JSON.stringify(exp),{name,part,included,exp});rows.push({name,part,included});await page.keyboard.press('Escape');}return rows;
 });
 await test('E03','Accuracy-paradox demo and reset cutoff',async()=>{
  await page.locator('#tab-basics').click();await page.locator('#demoAlwaysNegative').click();const a={tpr:await page.locator('#tpr').textContent(),accuracy:await page.locator('#liveAccuracy').textContent(),prevalence:await page.locator('#prevalence').inputValue()};check(a.tpr==='0%'&&parseFloat(a.accuracy)>=90,a);await page.locator('#demoDefaultCutoff').click();check(await page.locator('#threshold').inputValue()==='50','cutoff reset');return a;
 });
 await test('M06','F1 zero-detection edge case agrees with direct count formula',async()=>{
  const rows=[];for(let repeat=0;repeat<2;repeat++){await page.locator('#reset').click();await set('prevalence',10);await set('threshold',0);await page.locator('#tab-formulas').click();const a={repeat,tp:await page.locator('#tpNum').textContent(),fp:await page.locator('#fpNum').textContent(),fn:await page.locator('#fnNum').textContent(),actual:await page.locator('.f1-score strong').textContent(),expected:0};rows.push(a);}await page.locator('.f1-card').scrollIntoViewIfNeeded();await page.screenshot({path:root+'screenshots/bug-f1-zero-detections.png',fullPage:true});out.observations.push({id:'F1-zero',rows});check(rows.every(x=>Number(x.actual)===0&&x.actual!=='N/A'),rows);return rows;
 });
 await test('E04','Bayes posterior and comparison buttons independently match direct counts',async()=>{
  await page.locator('#reset').click();await page.locator('#tab-bayes').click();const rows=[];
  for(const p of [1,10,50,0,100]){await set('bayesPrevalence',p);const counts=await page.locator('#tpNum,#fpNum,#fnNum,#tnNum').allTextContents();const c=[Number(counts[0]),Number(counts[2]),Number(counts[1]),Number(counts[3])];const exp=expected(c).precision;const value=await page.locator('.probability-ring').getAttribute('data-value');if(exp===null)check(value==='na',value);else close(Number(value),exp,1e-8);rows.push({p,c,expected:exp,value,edge:await page.locator('#bayesEdge').textContent()});}
  for(const p of [10,50]){await page.locator('[data-learn-share="'+p+'"]').click();check(await page.locator('#prevalence').inputValue()===String(p),'comparison button');}return rows;
 });
 await test('E05','Cost tradeoff presets and synchronized sliders',async()=>{
  await page.locator('#tab-tradeoffs').click();const rows=[];for(const [p,v]of [['screening',80],['balanced',50],['conservative',20]]){await page.locator('[data-cost-scenario='+p+']').click();check(Number(await page.locator('#threshold').inputValue())===v,p);rows.push({p,threshold:v,tpr:await page.locator('#tpr').textContent(),fpr:await page.locator('#fpr').textContent()});}await set('tradeoffSeparation',85);check(await page.locator('#separation').inputValue()==='85','sync');return rows;
 });
 await test('E06','Accuracy-paradox narrative uses consistent prevalence and percentage',async()=>{
  const rows=[];for(let repeat=0;repeat<2;repeat++){await page.locator('#reset').click();await page.locator('#tab-basics').click();const txt=await page.locator('#learn-basics').innerText();rows.push(txt.slice(txt.indexOf('⚠️ The False Security Trap'),txt.indexOf('⚡ Demo')));}out.observations.push({id:'accuracy-trap',rows});await page.screenshot({path:root+'screenshots/bug-accuracy-trap.png',fullPage:true});check(!rows.some(x=>x.includes('10% sick')&&x.includes('50% accuracy')),rows);return rows;
 });
 await page.goto('http://localhost:8080/');
 // Independent normal CDF via Simpson integration, not application functions.
 const pdf=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
 const cdf=x=>{if(x<=-9)return 0;if(x>=9)return 1;let n=800,a=-9,b=x,h=(b-a)/n,s=pdf(a)+pdf(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*pdf(a+i*h);return s*h/3;};
 const prIntegral=(p,sep)=>{if(p===0)return 0;if(p===1)return 1;const sd=.16-.09*sep,d=.6*sep/sd;let n=4000,h=16/n,s=0;for(let i=0;i<=n;i++){const z=-8+i*h,r=cdf(z),f=cdf(z-d),v=(p*r)/(p*r+(1-p)*f);s+=(i===0||i===n?1:i%2?4:2)*v*pdf(z);}return s*h/3;};
 await test('M07','ROC-AUC and PR-AUC versus independent continuous Gaussian integration',async()=>{
  for(const sep of [0,30,60,100])for(const p of [1,10,50]){await set('separation',sep);await set('prevalence',p);await page.locator('#tabGraphRoc').click();const rocText=await page.locator('#rocPlot text').allTextContents();const actualRoc=Number(rocText.find(t=>/^\d\.\d{3}/.test(t)).slice(0,5));const expectedRoc=cdf((.6*sep/100)/((.16-.09*sep/100)*Math.SQRT2));await page.locator('#tabGraphPr').click();const prText=await page.locator('#prPlot text').allTextContents();const actualPr=Number(prText.find(t=>/^\d\.\d{3}/.test(t)).slice(0,5));const expectedPr=prIntegral(p/100,sep/100);out.curves.push({sep,p,actualRoc,expectedRoc,actualPr,expectedPr});close(actualRoc,expectedRoc,.00051);close(actualPr,expectedPr,.0015);}return out.curves;
 });
 await test('M08','ROC/PR/Bayes operating points agree with the same confusion counts',async()=>{
  await page.locator('#reset').click();await set('prevalence',37);const counts=await page.locator('#tpNum,#fpNum,#fnNum,#tnNum').evaluateAll(es=>es.map(e=>Number(e.title.match(/[\d.]+/)[0])));const c=[counts[0],counts[2],counts[1],counts[3]],exp=expected(c);const rows=[];
  for(const [tab,svg,x,y,left]of [['tabGraphRoc','rocPlot',exp.fpr,exp.recall,66],['tabGraphPr','prPlot',exp.recall,exp.precision,66],['tabGraphBayes','bayesPlot',.37,exp.precision,75]]){await page.locator('#'+tab).click();const point=await page.locator('#'+svg+' circle[r="7.5"]').evaluate(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));close((point.x-left)/340,x,1e-7);close((365-point.y)/310,y,1e-7);rows.push({svg,point,expected:{x,y}});}return rows;
 });
 await test('E07','Scenario-specific accessible summary labels',async()=>{
  const rows=[];for(let repeat=0;repeat<2;repeat++)for(const p of ['car','spam','fraud']){await page.locator('#presetSelect').selectOption(p);rows.push({repeat,p,label:await page.locator('#precbar').getAttribute('aria-label')});}await page.screenshot({path:root+'screenshots/bug-domain-summary.png',fullPage:true});out.observations.push({id:'domain-aria',rows});check(!rows.some(x=>x.label.includes('people with flu')),rows);return rows;
 });
 await page.locator('#reset').click();await page.locator('#tabGraphPr').click();await page.screenshot({path:root+'screenshots/pr-auc-label.png',fullPage:true});
 out.errors=page.__qaErrors||[];return out;
}
