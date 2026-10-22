import { chromium } from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const src=readFileSync('assets/stainher-v1524-theme.js','utf8');
const css=src.match(/const css=`([\s\S]*?)`;/)?.[1];
assert.ok(css,'No se extrajo CSS real del tema');
const browser=await chromium.launch({headless:true});
mkdirSync('artifacts',{recursive:true});
try{
 for(const theme of ['light','modern']){
  const page=await browser.newPage({viewport:{width:1280,height:780},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html data-theme="${theme}"><head></head><body>
    <section id="page-liderazgo">
      <div class="v1519-period-summary"><span>Período analizado: Octubre 2026 · Administrador</span></div>
      <div class="v1512-lead-kpis v1523-lead-kpis">
        <div class="v1512-mini-kpi"><span>Programados</span><b>0</b></div>
        <div class="v1512-mini-kpi"><span>Realizados</span><b>0</b></div>
        <div class="v1512-mini-kpi"><span>Pendientes</span><b>0</b></div>
        <div class="v1512-mini-kpi"><span>Vencidos</span><b class="v1512-overdue">0</b></div>
        <div class="v1512-mini-kpi"><span>Cumplimiento</span><b>0%</b></div>
        <div class="v1512-mini-kpi"><span>Ejecuciones libres</span><b>0</b></div>
      </div>
    </section></body></html>`);
  await page.addStyleTag({content:css});
  const inspect=await page.locator('#page-liderazgo .v1512-mini-kpi').evaluateAll(nodes=>nodes.map(n=>{
    const s=getComputedStyle(n),text=getComputedStyle(n.querySelector('b'));
    return {background:s.backgroundColor,text:text.color};
  }));
  assert.equal(inspect.length,6);
  for(const [index,entry] of inspect.entries()){
    const get=v=>(v.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    const [r,g,b]=get(entry.background);
    assert.ok(r>220&&g>225&&b>230,`${theme} KPI ${index} fondo: ${entry.background}`);
    assert.notEqual(entry.text,entry.background,`${theme} KPI ${index} texto invisible`);
  }
  const period=await page.locator('.v1519-period-summary').evaluate(n=>getComputedStyle(n).backgroundColor);
  assert.ok(Number(period.match(/\d+/)[0])>200,`${theme}: período sigue oscuro`);
  await page.screenshot({path:`artifacts/liderazgo-${theme}.png`,fullPage:true});
  console.log(`OK: ${theme}, 6 KPI y período claro; captura artifacts/liderazgo-${theme}.png`);
  await page.close();
 }
}finally{await browser.close()}
