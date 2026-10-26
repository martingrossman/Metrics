const {webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
(async()=>{
 const out={method:'Supplemental installed Playwright WebKit execution; primary campaign uses Playwright MCP Chromium.',tests:[],responsive:[],errors:[]};
 let browser;
 try{browser=await webkit.launch();out.version=browser.version();}catch(e){out.status='BLOCKED';out.error=e.message;fs.writeFileSync(path.join(root,'webkit-results.json'),JSON.stringify(out,null,2));return;}
 try{
  const sizes=[[320,568],[375,667],[390,844],[402,874],[430,932],[360,800],[412,915],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[2560,1440]];
  for(const [w,h]of sizes){const context=await browser.newContext({viewport:{width:w,height:h},isMobile:w<=650,hasTouch:w<=650});const page=await context.newPage();page.on('pageerror',e=>out.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')out.errors.push(m.text());});page.on('requestfailed',r=>out.errors.push(r.url()+': '+r.failure()?.errorText));await page.goto('http://localhost:8080/');const modes=[];
   for(const [tab,mode]of [['tabGraphScores','default'],['tabGraphSplit','4up'],['tabGraphGauss','gauss'],['tabGraphRoc','roc'],['tabGraphPr','pr'],['tabGraphBayes','bayes']]){await page.locator('#'+tab).click();const m=await page.evaluate(()=>({viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],horizontal:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,invalidSvg:[...document.querySelectorAll('svg *')].some(e=>[...e.attributes].some(a=>/NaN|Infinity/.test(a.value)))}));m.mode=mode;
    if(mode==='default'||mode==='4up'){m.screenshot=`screenshots/webkit-${w}x${h}-${mode}.png`;await page.screenshot({path:path.join(root,m.screenshot),fullPage:true});}modes.push(m);
   }
   await page.locator('#tabGraphScores').click();await page.locator('#precisionCard')[w<=650?'tap':'click']();const pinned=await page.locator('#precisionCard').getAttribute('aria-pressed');await page.keyboard.press('Escape');const cleared=await page.locator('#precisionCard').getAttribute('aria-pressed');out.tests.push({id:`W-pin-${w}`,status:pinned==='true'&&cleared==='false'?'PASS':'FAIL',pinned,cleared});
   for(const p of ['balanced','car','spam','fraud','generic']){await page.locator('#presetSelect').selectOption(p);const s=await page.evaluate(()=>({preset:document.getElementById('presetSelect').value,total:['tp','fp','fn','tn'].reduce((sum,k)=>sum+Number(document.getElementById(k+'Num').title.match(/[\d.]+/)[0]),0),rates:['tpr','fpr','precision'].map(k=>document.getElementById(k).textContent)}));out.tests.push({id:`W-preset-${w}-${p}`,status:s.preset===p&&Math.abs(s.total-1000)<1e-7?'PASS':'FAIL',...s});}
   out.responsive.push({w,h,modes});await context.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://localhost:8080/learn.html');await page.locator('#prevalence').evaluate(e=>{e.value='10';e.dispatchEvent(new Event('input'));});await page.locator('#threshold').evaluate(e=>{e.value='0';e.dispatchEvent(new Event('input'));});await page.locator('#tab-formulas').click();const f1=await page.locator('.f1-score strong').textContent();out.tests.push({id:'W-f1-zero',status:f1==='0.000'?'PASS':'FAIL',actual:f1,expected:'0.000'});await page.locator('.f1-card').screenshot({path:path.join(root,'screenshots/webkit-f1-zero.png')});await page.close();out.status='COMPLETE';
 }catch(e){out.status='PARTIAL';out.error=e.stack;}
 finally{await browser.close();fs.writeFileSync(path.join(root,'webkit-results.json'),JSON.stringify(out,null,2));console.log(JSON.stringify({status:out.status,version:out.version,tests:out.tests.length,failed:out.tests.filter(t=>t.status==='FAIL'),viewports:out.responsive.length,errors:out.errors,error:out.error},null,2));}
})();
