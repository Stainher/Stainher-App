import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';

const source=readFileSync('index.html','utf8');
const rpcStart=source.indexOf('async function v13GetSupervisors(){');
const rpcEnd=source.indexOf('\nv12FillSupervisor=',rpcStart);
const wrapStart=source.indexOf('const _openTerrainControlV13Base=openTerrainControlV95;');
const wrapEnd=source.indexOf('const _terrainDataV13Base=terrainDataV11;',wrapStart);
assert.ok(rpcStart>0 && rpcEnd>rpcStart && wrapStart>0 && wrapEnd>wrapStart,'Código real de formulario localizado');
const rpcSource=source.slice(rpcStart,rpcEnd);
const wrapperSource=source.slice(wrapStart,wrapEnd);
const lastSubmit=source.slice(source.lastIndexOf('generateTerrainPdfV11=async function(e){'),source.indexOf('\n};',source.lastIndexOf('generateTerrainPdfV11=async function(e){'))+3);

test('R375: selección de supervisores en Control Preventivo de Terreno',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<html><body><main id="modalRoot"></main></body></html>');
  await page.addScriptTag({content:
   "window.currentRole='administrador';"+
   "const state={profile:{nombre:'Administrador'},session:{user:{id:'admin-id'}}};"+
   "const sb={rpc:async(name)=>{window.__calls.push(name);"+
   "return name==='liderazgo_supervisores_v13'&&window.__emptyPrimary?{data:[],error:null}:"+
   "{data:[{nombre:'Luis Contreras',user_id:'id-luis'},{nombre:'Cristian Flores',user_id:'id-cristian'}],error:null}}};"+
   "window.__calls=[];window.__emptyPrimary=false;"+
   "function v11Role(){return window.currentRole}"+
   "function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\\\"/g,'&quot;')}"+
   "async function currentSupervisorIdentityV11(){return {user_id:'self-id',nombre:'Supervisor actual'}}"+
   "async function openTerrainControlV95(){document.getElementById('modalRoot').innerHTML='<form id=\"terrainFormV11\"><label>Supervisor / observador<select id=\"terrainSupervisorV11\"></select></label></form>'}"+
   rpcSource + wrapperSource
  });
  await page.evaluate(()=>window.openTerrainControlV95());
  const select=page.locator('#terrainSupervisorV11');
  assert.equal(await select.isEnabled(),true);
  assert.equal(await select.locator('option').count(),3);
  assert.equal(await select.locator('option').nth(1).textContent(),'Luis Contreras');
  await select.selectOption('Cristian Flores');
  assert.equal(await select.inputValue(),'Cristian Flores');

  await page.evaluate(()=>{window.currentRole='prevencion';window.__emptyPrimary=true});
  await page.evaluate(()=>window.openTerrainControlV95());
  assert.equal(await select.isEnabled(),true,'Prevención puede elegir supervisor');
  assert.ok(await page.evaluate(()=>window.__calls.includes('liderazgo_supervisores')),'RPC alternativo utilizado');
  assert.equal(await select.locator('option').count(),3);

  await page.evaluate(()=>{window.currentRole='supervisor';window.__emptyPrimary=false});
  await page.evaluate(()=>window.openTerrainControlV95());
  assert.equal(await select.isDisabled(),true,'Supervisor mantiene restricción a su identidad');
  assert.equal(await select.locator('option').count(),1);
  assert.equal(await select.inputValue(),'Supervisor actual');
 }finally{await browser.close()}
});

test('R375: el supervisor seleccionado permanece en el cumplimiento y PDF',()=>{
 assert.match(lastSubmit,/if\(!d\.supervisor\)missing\.push\('Supervisor'\)/);
 assert.match(lastSubmit,/supervisor_user_id:d\.supervisor_user_id\|\|null,supervisor_nombre:d\.supervisor\|\|null/);
 assert.match(lastSubmit,/fuera_programacion:!!free/);
 assert.match(lastSubmit,/ejecutado_por_user_id:state\.session\.user\.id/);
 assert.doesNotMatch(lastSubmit,/if\(free\)d\.supervisor=payload\.ejecutado_por_nombre/);
 assert.match(lastSubmit,/buildTerrainPdfV11\(d\)/);
});
