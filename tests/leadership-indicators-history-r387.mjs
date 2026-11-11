import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const runtime=readFileSync('assets/stainher-v1524-leadership-indicators-r387.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(runtime);
assert.match(loader,/await refreshLeadershipIndicatorsR387\(\)/);
assert.match(loader,/stainher-v1524-leadership-indicators-r387\.js/);
assert.doesNotMatch(runtime,/new\s+MutationObserver\s*\(|setInterval\s*\(/);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<section id="page-liderazgo"><div id="v1512Lead_indicadores"><div class="panel"><h3>Cumplimiento por usuario</h3></div><div class="panel"><h3>Controles realizados</h3><div data-r387="records">Registros visibles: 1</div></div></div></section>');
 await page.evaluate(()=>{
  window.state={leadershipYear:2026,leadershipMonth:11};
  const records=[{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',fecha:'2026-11-06',created_at:'2026-11-06T20:00:00Z',supervisor_nombre:'Cristian Flores',supervisor_user_id:'u1',ejecutado_por_nombre:'Cristian Flores',ejecutado_por_user_id:'u1',control_codigo:'CTRL-05',control_nombre:'Check List de Extintores',fuera_programacion:true,estado:'realizado'}];
  window.sb={from(table){
   const q={month:11,select(){return this},eq(field,value){if(field==='mes')this.month=value;return this},order(){return this},limit(){return this},then(ok,bad){return Promise.resolve({data:this.month===11?(table==='liderazgo_cumplimiento'?records:[]):[],error:null}).then(ok,bad)}};
   return q;
  }};
 });
 await page.addScriptTag({content:runtime});
 assert.equal(await page.evaluate(()=>window.StainherLeadershipIndicatorsR387.refresh(true)),true);
 const users=page.locator('[data-r387="users"]');
 const done=page.locator('[data-r387="records"]');
 await users.getByText(/Sin metas programadas/).waitFor();
 assert.match(await users.innerText(),/Ejecuciones libres: 1/);
 assert.match(await users.innerText(),/Sin meta asignada/);
 assert.equal(await done.count(),0);
 await page.evaluate(()=>{window.state.leadershipMonth=10});
 await page.evaluate(()=>window.StainherLeadershipIndicatorsR387.refresh(true));
 assert.match(await users.innerText(),/No hay controles ni metas/);
 await page.close();
}finally{await browser.close()}
console.log('R387: indicadores con metas cero, respeto de período y retiro del historial duplicado');
