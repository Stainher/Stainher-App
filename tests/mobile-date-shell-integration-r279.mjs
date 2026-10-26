import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const index=readFileSync('index.html','utf8');
const start=index.indexOf('(function installStainherIOSNativeControlShell(){');
const stop=index.indexOf('})();',start);
assert.ok(start>0&&stop>start,'Missing real iOS shell bootstrap in index.html');
const legacy=index.slice(start,stop+5);
const picker=readFileSync('assets/stainher-v1524-date-picker.js','utf8');
const visual=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const form='<section id="page-preventivo"><label>MES CONTRACTUAL <input id="v1523PrevEdpMonth" class="field" type="month" value="2026-11"></label></section>'
  +'<section id="page-correctivo"><div class="v1519-filter-grid">'
  +'<label>DESDE<input id="corrFromV1519" class="field" type="date" value="2026-10-01"></label>'
  +'<label>HASTA<input id="corrToV1519" class="field" type="date" value="2026-10-31"></label>'
  +'</div></section>';
try{
 for(const [theme,order] of [['light','legacy-first'],['modern','legacy-first'],['light','picker-first'],['light','dynamic']]){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.setContent('<!doctype html><html data-theme="'+theme+'"><head><style>'
    +'body{font:16px Arial;background:#dcecf4;color:#17344d}#page-preventivo,#page-correctivo{margin:22px;max-width:340px}'
    +'.field{display:block;width:100%;padding:12px;border:1px solid #b7cadc;border-radius:10px}'
    +'.v1519-filter-grid{display:grid;gap:12px}'
    +'#page-correctivo .field{border:1px solid white;color:white;border-radius:999px;background:linear-gradient(110deg,#f56022,#c63a0b)}'
    +'</style><style>'+visual+'</style></head><body><main id="appView">'+(order==='dynamic'?'':form)+'</main></body></html>');
   if(order==='picker-first'){
     await page.addScriptTag({content:picker});
     await page.addScriptTag({content:legacy});
   }else{
     await page.addScriptTag({content:legacy});
     await page.addScriptTag({content:picker});
   }
   if(order==='dynamic')await page.evaluate(html=>document.getElementById('appView').innerHTML=html,form);
   await page.waitForFunction(()=>['v1523PrevEdpMonth','corrFromV1519','corrToV1519'].every(id=>
     document.getElementById(id)?.parentElement?.querySelector('.stainher-calendar-button')));
   await page.waitForTimeout(120);
   const results=await page.evaluate(()=>['v1523PrevEdpMonth','corrFromV1519','corrToV1519'].map(id=>{
     const input=document.getElementById(id),parent=input.parentElement;
     const span=parent.querySelector(':scope > .stainher-native-control-shell__value');
     const ins=getComputedStyle(input),box=getComputedStyle(parent);
     return {id, value:input.value, marker:input.dataset.stainherNativeShell,
       wrapper:parent.className, buttons:parent.querySelectorAll(':scope > .stainher-calendar-button').length,
       nested:parent.parentElement?.classList.contains('stainher-date-picker'),
       valueText:span?.textContent||'', textColor:span?getComputedStyle(span).color:null,
       shellBg:box.backgroundImage, shellBorder:box.borderTopWidth,inputBorder:ins.borderTopWidth,
       inputOpacity:parseFloat(ins.opacity),pseudo:getComputedStyle(parent,'::after').content};
   }));
   for(const x of results){
     assert.ok(x.value,'Input date/month must retain value: '+order+'/'+x.id);
     assert.equal(x.marker,'1','Legacy observer should not re-wrap enhanced input');
     assert.equal(x.buttons,1,'Exactly one clickable calendar button');
     assert.equal(x.nested,false,'No nested visual shells');
     if(x.wrapper.includes('stainher-native-control-shell')){
       assert.ok(x.valueText,'Visible label must survive the date-picker install: '+x.id);
       assert.match(x.shellBg,/linear-gradient/,'Styled native shell must retain gradient');
       assert.equal(x.pseudo,'none','No duplicate calendar pseudo icon');
       if(x.id==='v1523PrevEdpMonth'){
         assert.match(x.valueText,/noviembre/i,'Contractual month must remain readable');
         assert.equal(x.textColor,'rgb(23, 52, 77)','Readable light/modern month text');
       }else{
         assert.equal(x.shellBorder,'0px','No white outer frame');
         assert.equal(x.inputBorder,'0px','No white inner frame');
         assert.equal(x.textColor,'rgb(255, 255, 255)','White date on orange gradient');
       }
     }else{
       assert.ok(x.inputOpacity>.9,'No transparent native input without a visible label');
     }
   }
   if(order==='legacy-first'&&theme==='light'){
     await page.evaluate(()=>{
       const input=document.getElementById('v1523PrevEdpMonth');
       input.value='2026-12';input.dispatchEvent(new Event('change',{bubbles:true}));
     });
     assert.match(await page.locator('#page-preventivo .stainher-native-control-shell__value').textContent(),/diciembre/i);
     await page.screenshot({path:'artifacts/mobile-datepicker-single-shell-r279.png',fullPage:true});
   }
   await page.close();
 }
}finally{await browser.close();}
console.log('R279 integrated mobile date/month controls: values visible, one shell, no white date outlines.');