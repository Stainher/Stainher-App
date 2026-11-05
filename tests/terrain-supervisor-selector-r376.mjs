import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';
const src=readFileSync('assets/stainher-v1524-terrain-supervisor-r376.js','utf8');
new Function(src);
test('R376: Administrador puede elegir supervisor en formulario real',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<html><body><div id="modalRoot"><form><label>Supervisor / Observador <select id="terrainSupervisorV11" disabled><option value="">Seleccionar supervisor</option></select></label></form></div></body></html>');
  await page.evaluate(()=>{
   window.v11Role=()=>window.__rol;
   window.__rol='administrador';
   window.sb={rpc:async()=>({data:[
    {nombre:'Luis Contreras',user_id:'u1'},
    {nombre:'Cristian Flores',user_id:'u2'},
    {nombre:'Manuel Guanipa',user_id:'u3'},
    {nombre:'Luis Rojas',user_id:'u4'}
   ],error:null})};
  });
  await page.addScriptTag({content:src});
  const selector=page.locator('#terrainSupervisorV11');
  await page.waitForFunction(()=>document.getElementById('terrainSupervisorV11')?.options.length===5);
  assert.equal(await selector.isEnabled(),true);
  assert.equal(await selector.locator('option').count(),5);
  await selector.selectOption('Cristian Flores');
  assert.equal(await selector.inputValue(),'Cristian Flores');
  assert.equal(await page.locator('option:checked').getAttribute('data-user-id'),'u2');
  await page.evaluate(()=>{
   const s=document.getElementById('terrainSupervisorV11');
   s.replaceChildren(new Option('Seleccionar supervisor',''));
   s.disabled=true;
  });
  await page.waitForFunction(()=>document.getElementById('terrainSupervisorV11')?.options.length===5);
  assert.equal(await selector.inputValue(),'Cristian Flores');
 }finally{await browser.close()}
});
test('R376: perfiles Supervisor permanecen restringidos',async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<html><body><select id="terrainSupervisorV11" disabled><option value="Luis Contreras">Luis Contreras</option></select></body></html>');
  await page.evaluate(()=>{window.v11Role=()=> 'supervisor';window.sb={rpc:async()=>({data:[{nombre:'Otro'}],error:null})}});
  await page.addScriptTag({content:src});
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#terrainSupervisorV11').isDisabled(),true);
  assert.equal(await page.locator('#terrainSupervisorV11 option').count(),1);
 }finally{await browser.close()}
});
