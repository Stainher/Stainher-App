import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const history=readFileSync('assets/stainher-v1524-hp-history-r71.js','utf8');
const disclosure=readFileSync('assets/stainher-v1524-collapsible.js','utf8');
assert.match(history,/HP_HISTORY_VERSION__='R294'/);
assert.match(history,/data-no-collapse|noCollapse/);
assert.match(history,/data-hp-history-body/);
assert.match(history,/QUERY_LIMIT_MS=12000/);

const browser=await chromium.launch({headless:true});
const html='<html><body><main id="appView"><section id="page-turnos" class="page"><section id="page-reporte-hp"><label>Mes <input id="hpMonth" type="month" value="2026-10"></label><div class="panel"><h3>Resumen Mensual</h3><table class="hp-summary"><tbody><tr><th>TOTAL HH EN FAENA</th><td>2576</td></tr><tr><th>Total FTE</th><td>14,1</td></tr></tbody></table></div></section></section></main></body></html>';
async function setup(fail=false){
  const page=await browser.newPage();
  await page.setContent(html);
  await page.addScriptTag({content:`
    window.historyCalls=0;
    window.sb={from(name){
      window.historyCalls++;
      const q={
        select(){return this},not(){return this},gte(){return this},lte(){return this},eq(){return this},abortSignal(){return this},
        then(resolve,reject){
          return new Promise((ok,no)=>setTimeout(()=>{
            if(${fail} && name==='turnos_malla_v1512')no(new Error('Falla de prueba'));
            else ok({data: name==='dotacion_contrato'?[{user_id:'u1',nombre:'Colaborador',cargo:'Técnico',fecha_inicio_contrato:'2026-01-01'}]: name==='perfiles'?[{id:'u1',rol:'tecnico'}]: name==='turnos_malla_v1512'?[{user_id:'u1',fecha:'2026-09-01',turno_base:'A'}]:[],error:null});
          },120)).then(resolve,reject);
        }
      };
      return q;
    }};
  `});
  await page.addScriptTag({content:history});
  await page.addScriptTag({content:disclosure});
  await page.evaluate(()=>{
    const p=document.getElementById('page-reporte-hp');
    window.StainherHPHistory.mount(p);
    window.StainherHPHistory.mount(p);
  });
  return page;
}
try{
  const page=await setup();
  try{
    await page.locator('#hpHistoryR71 .hp-history-table').waitFor({timeout:8000});
    const panel=page.locator('#hpHistoryR71');
    assert.equal(await panel.count(),1);
    assert.equal(await panel.evaluate(el=>el.tagName),'DETAILS');
    assert.equal(await panel.getAttribute('data-no-collapse'),'1');
    assert.equal(await panel.getAttribute('data-hp-history-stable'),'1');
    const summary=await panel.locator('summary').innerText();
    assert.match(summary,/Comparación últimos 3 meses cerrados/);
    const rendered=await panel.innerText();
    for(const month of ['Julio-26','Agosto-26','Septiembre-26'])assert.match(rendered,new RegExp(month));
    assert.match(rendered,/Principales variaciones/);
    assert.equal(await page.evaluate(()=>window.historyCalls),5,'La carga se hace una sola vez aunque se monte dos veces');
    await panel.locator('summary').click();
    assert.equal(await panel.evaluate(el=>el.open),false,'Panel colapsable');
    await panel.locator('summary').click();
    assert.equal(await panel.evaluate(el=>el.open),true,'Panel expansible');
    await page.evaluate(()=>window.StainherHPHistory.mount(document.getElementById('page-reporte-hp')));
    assert.equal(await page.evaluate(()=>window.historyCalls),5,'No recalcula la misma tabla');
  }finally{await page.close()}
  const failing=await setup(true);
  try{
    const retry=failing.locator('#hpHistoryR71 [data-hp-history-retry]');
    await retry.waitFor({timeout:8000});
    assert.match(await failing.locator('#hpHistoryR71').innerText(),/Falla de prueba/);
    assert.equal(await failing.locator('#hpHistoryR71').evaluate(el=>el.isConnected),true);
  }finally{await failing.close()}
}finally{await browser.close()}
console.log('R294: panel nativo estable y tabla visible con transformaciones desplegables activas');
