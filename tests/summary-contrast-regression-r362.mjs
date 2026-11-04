import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('assets/stainher-v1524-kpi-contrast-r362.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(source);new Function(loader);
assert.match(loader,/refreshKpiContrastR362/);
assert.match(loader,/stainher-v1524-kpi-contrast-r362\.js/);
assert.doesNotMatch(source,/setInterval/);
try {
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  const p=await browser.newPage({viewport:{width:1440,height:900}});
  await p.setContent('<html data-theme="'+theme+'"><head><style>.white{background:white!important;color:white!important}.bad-number{background:#236ea9;color:#15344c}.row{display:flex;gap:8px}</style></head><body><main id="app">'+
   '<section id="page-preventivo"><div class="row stainher-r359-kpi" id="prev-row"><div class="kpi"><small>TOTAL PERÍODO</small><strong>28</strong></div><div class="kpi"><small>POR CALENDARIZAR</small><strong>19</strong></div></div></section>'+
   '<section id="page-dotacion"><div id="dot-card" class="summary-box"><div>DOTACIÓN VISIBLE</div><div class="bad-number stainher-unified-kpi-r360">20</div></div></section>'+
   '<section id="page-liderazgo"><div class="v1512-mini-kpi"><span>PROGRAMADOS</span><b>0</b></div></section>'+
   '<section id="page-administracion"><div class="v1520-kpi white"><div>VALOR VIGENTE</div><strong>$5.506.993.265</strong></div><div class="v1520-kpi white"><div>EDP REGISTRADOS</div><b>17</b></div></section>'+
   '<section id="page-sistema"><div class="system-stat"><small>EQUIPOS</small><b>9</b></div></section>'+
   '<section id="page-reembolsos"><table><tr><td id="table-cell">No colorear tabla 17</td></tr></table><button id="normal-button">Actualizar</button></section>'+
   '</main></body></html>');
  await p.addScriptTag({content:source});
  const out=await p.evaluate(()=>{
   const selectors=['#page-preventivo .kpi','#dot-card','#page-liderazgo .v1512-mini-kpi','#page-administracion .v1520-kpi','#page-sistema .system-stat'];
   return {cards:selectors.flatMap(s=>[...document.querySelectorAll(s)]).map(el=>({
     marked:el.classList.contains('stainher-kpi-card-r362'),
     background:getComputedStyle(el).backgroundImage,
     label:getComputedStyle(el.querySelector('small,span,div')).color,
     value:getComputedStyle(el.querySelector('strong,b,.bad-number')).color
   })),
   row:document.getElementById('prev-row').classList.contains('stainher-r359-kpi'),
   nested:document.querySelector('.bad-number').classList.contains('stainher-unified-kpi-r360'),
   table:document.getElementById('table-cell').classList.contains('stainher-kpi-card-r362'),
   button:document.getElementById('normal-button').classList.contains('stainher-kpi-card-r362')};
  });
  for(const card of out.cards){
   assert.equal(card.marked,true,theme+' missing KPI');
   assert.match(card.background,/linear-gradient/);
   assert.equal(card.label,'rgb(255, 255, 255)');
   assert.equal(card.value,'rgb(255, 255, 255)');
  }
  assert.equal(out.row,false,'No marcar barra de cinco indicadores');
  assert.equal(out.nested,false,'No dejar relleno en sólo el número');
  assert.equal(out.table,false);assert.equal(out.button,false);
  await p.close();
 }
}finally{await browser.close()}
} catch(error) { console.error('R362 DIAGNOSTIC: '+(error?.stack||error)); throw error; }
console.log('R362: 3 temas, KPI completos, contraste blanco, sin afectar tablas ni botones');
