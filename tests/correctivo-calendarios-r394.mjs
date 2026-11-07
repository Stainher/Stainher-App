import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const runtime=readFileSync('assets/stainher-v1524-correctivo-calendar-r394.js','utf8');
const css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(runtime);new Function(loader);
assert.match(loader,/await refreshCorrectivoCalendarR394\(\)/);
assert.match(loader,/stainher-v1524-correctivo-calendar-r394\.js/);
assert.match(css,/R394.*Correctivo/);
assert.doesNotMatch(runtime,/new\s+MutationObserver|setInterval\s*\(/);
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  for(const width of [390,1200]){
   const mobile=width===390;
   const page=await browser.newPage({viewport:{width,height:844},isMobile:mobile,hasTouch:mobile});
   await page.setContent('<!doctype html><html data-theme="'+theme+'"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<style>body{margin:0;background:#e4f0f8;color:#19354d;font:16px Arial}#page-correctivo{padding:14px;max-width:100%;box-sizing:border-box}'+
    '.v1519-filter-grid{display:grid;grid-template-columns:1fr;gap:14px}'+
    '.stainher-date-picker{position:relative;display:block;padding:8px;background:#fff;border:1px solid #bdd0df;border-radius:12px}'+
    '.stainher-calendar-button{position:absolute;right:4px;top:4px}'+
    '</style></head><body><section id="page-correctivo"><div class="v1519-filter-grid">'+
    '<label>DESDE<span class="stainher-date-picker"><input type="date" id="corrFromV1519" value="2026-11-01"><button type="button" class="stainher-calendar-button">Antiguo icono</button></span></label>'+
    '<label>HASTA<span class="stainher-date-picker"><input type="date" id="corrToV1519" value="2026-11-30"><button type="button" class="stainher-calendar-button">Antiguo icono</button></span></label>'+
    '</div><p id="selected-period">Período seleccionado</p></section><section id="page-preventivo"><input type="date" value="2026-11-05"></section></body></html>');
   await page.addStyleTag({content:css});
   await page.evaluate(()=>{
    window.__dateChanges=[];
    for(const id of ['corrFromV1519','corrToV1519']){
     document.getElementById(id).addEventListener('change',()=>window.__dateChanges.push({id,value:document.getElementById(id).value}));
    }
   });
   await page.addScriptTag({content:runtime});
   await page.evaluate(()=>window.StainherCorrectivoCalendarR394.mount());
   const fields=page.locator('#page-correctivo .r394-date-field');
   assert.equal(await fields.count(),2,'one visual widget for each date');
   assert.equal(await fields.first().locator('.r394-date-button').count(),1);
   assert.equal(await fields.last().locator('.r394-date-button').count(),1);
   assert.equal(await page.locator('#corrFromV1519').inputValue(),'2026-11-01');
   assert.equal(await page.locator('#corrToV1519').inputValue(),'2026-11-30');
   assert.equal(await fields.first().locator('.r394-date-text').innerText(),'01-11-2026');
   const h=await fields.first().locator('.r394-date-button').evaluate(el=>el.getBoundingClientRect().height);
   assert.ok(h>=48&&h<=60,'compact date button: '+h);
   assert.equal(await page.locator('#page-preventivo input[type=date]').isVisible(),true,'other forms untouched');
   await fields.first().locator('.r394-date-button').click();
   const modal=page.locator('#stainher-corr-date-modal-r394');
   assert.equal(await modal.isVisible(),true,'calendar opens');
   assert.match(await modal.locator('.r394-month-label').innerText(),/noviembre de 2026/);
   assert.equal(await modal.locator('.r394-day').count(),30);
   const bounds=await modal.locator('.r394-dialog').boundingBox();
   assert.ok(bounds&&bounds.x>=0&&bounds.width<=width+1,'calendar fits '+width+'px screen');
   await modal.locator('[data-r394-day="2026-11-15"]').click();
   assert.equal(await page.locator('#corrFromV1519').inputValue(),'2026-11-15');
   assert.equal(await fields.first().locator('.r394-date-text').innerText(),'15-11-2026');
   assert.equal(await modal.isVisible(),false,'closes after choosing date');
   assert.equal(await page.evaluate(()=>window.__dateChanges.length),1,'existing change filter event fired once');
   await fields.last().locator('.r394-date-button').click();
   await modal.locator('[data-r394-act="prev"]').click();
   assert.match(await modal.locator('.r394-month-label').innerText(),/octubre de 2026/);
   await modal.locator('[data-r394-act="next"]').click();
   assert.match(await modal.locator('.r394-month-label').innerText(),/noviembre de 2026/);
   await modal.locator('[data-r394-act="close"]').first().click();
   assert.equal(await page.locator('#corrToV1519').inputValue(),'2026-11-30','cancel keeps selected date');
   await page.evaluate(()=>window.StainherCorrectivoCalendarR394.mount());
   assert.equal(await fields.count(),2,'no duplicate widgets on rerender');
   assert.equal(await page.locator('#page-correctivo .r394-date-button').count(),2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'no horizontal overflow');
   await page.close();
  }
 }
}finally{await browser.close()}
console.log('R394: Correctivo mobile date fields compact, calendars accessible, original date change events preserved.');
