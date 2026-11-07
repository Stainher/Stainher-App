import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const feature=readFileSync('assets/stainher-v1524-extintores-supervisor-r386.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(feature);
assert.match(loader,/await refreshExtintoresSupervisorR386\(\)/);
assert.doesNotMatch(loader,/await refreshExtintoresSupervisorR385\(\)/);
assert.doesNotMatch(loader,/await refreshExtintoresSupervisorR383\(\)/);
assert.doesNotMatch(feature,/new\s+MutationObserver\s*\(|setInterval\s*\(/);
const supervisors=['Luis Contreras','Cristian Flores','Manuel Guanipa','Luis Rojas'];
const browser=await chromium.launch({headless:true});
try{
 for(const field of [
    '<label>Supervisor</label><input type="number" id="extSupervisor" name="supervisor_nombre" required>',
    '<label>Supervisor<select disabled id="extSupervisor" name="supervisor_nombre"><option value=""></option></select></label>'
 ]){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent('<div id="modalRoot"><div class="modal"><h2>Check List de Extintores</h2><form id="extFormV157"><div class="field-row">'+field+'</div><label>Fecha del control<input type="date"></label></form></div></div>');
  await page.evaluate(names=>{
    window.sb={rpc:async function(proc){return {data:names.map((nombre,i)=>({nombre,user_id:'supervisor-'+i})),error:null}}};
  },supervisors);
  await page.addScriptTag({content:feature});
  assert.equal(await page.evaluate(()=>window.StainherExtintoresSupervisorR386.refresh()),true);
  const visible=page.locator('select').first();
  assert.equal(await visible.locator('option').count(),5,'placeholder + cuatro supervisores');
  await visible.selectOption({label:'Cristian Flores'});
  const original=await page.locator('#extSupervisor').evaluate(el=>({value:el.value,tag:el.tagName,type:el.type,disabled:el.disabled}));
  assert.equal(original.value,'Cristian Flores');
  assert.equal(original.disabled,false);
  await page.evaluate(()=>window.StainherExtintoresSupervisorR386.refresh());
  assert.equal(await visible.locator('option').count(),5,'sin duplicación de opciones');
  assert.equal(await visible.inputValue(),'Cristian Flores','mantiene selección');
  await page.close();
 }
}finally{await browser.close()}
console.log('R386: Supervisor móvil funciona con input numérico o select; sin congelamiento');
