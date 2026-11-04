import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const file='assets/stainher-v1524-summary-design-r360.js';
const src=readFileSync(file,'utf8'),loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(src);
assert.match(loader,/refreshUnifiedSummaryR360/);
assert.match(loader,/stainher-v1524-summary-design-r360\.js/);
assert.doesNotMatch(src,/setInterval/);
assert.match(src,/MutationObserver/);
assert.match(src,/\.stainher-unified-kpi-r360/);
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  const page=await browser.newPage({viewport:{width:1140,height:780}});
  await page.setContent('<!DOCTYPE html><html data-theme="'+theme+'"><head></head><body><main id="app">'+
    '<section id="page-preventivo"><div class="kpi"><small>Por calendarizar</small><strong>19</strong></div>'+
    '<div class="panel"><h3>Plan de mantenimiento</h3><button>Actualizar</button></div></section>'+
    '<section id="page-contrato"><div class="v1520-kpi"><small>Total del mes</small><b>$24.069</b></div>'+
    '<div class="v1520-table-wrap"><table><tr><td>Reporte</td></tr></table></div></section>'+
    '<section id="page-inicio"><div class="v1524-home-kpi"><span>Operativos hoy</span><b>9</b></div></section>'+
    '<section id="page-correctivo"><div class="grid-kpi"><div class="kpi"><small>Abiertas</small><strong>12</strong></div></div></section>'+
    '<section id="page-boletas-rendir"><div class="r354-kpi"><small>Total rendido</small><strong>$22.000</strong></div></section>'+
    '</main></body></html>');
  await page.addScriptTag({content:src});
  const result=await page.evaluate(()=>{
   const selectors=['#page-preventivo .kpi','#page-contrato .v1520-kpi','#page-inicio .v1524-home-kpi','#page-correctivo .kpi','#page-boletas-rendir .r354-kpi'];
   return {
    kpis:selectors.map(s=>{const el=document.querySelector(s);const css=getComputedStyle(el),title=getComputedStyle(el.querySelector('small,span')),value=getComputedStyle(el.querySelector('b,strong'));return {marked:el.classList.contains('stainher-unified-kpi-r360'),bg:css.backgroundImage,title:title.color,value:value.color}}),
    ordinary:document.querySelector('.panel').classList.contains('stainher-unified-kpi-r360'),
    table:document.querySelector('.v1520-table-wrap').classList.contains('stainher-unified-kpi-r360')
   };
  });
  for(const k of result.kpis){assert.ok(k.marked,theme+' KPI missing');assert.match(k.bg,/linear-gradient/);assert.equal(k.value,'rgb(255, 255, 255)');assert.equal(k.title,'rgb(255, 255, 255)')}
  assert.equal(result.ordinary,false);assert.equal(result.table,false);
  await page.close();
 }
}finally{await browser.close()}
console.log('R360: all theme cards blue gradient, texts white, ordinary panels/tables unchanged');
