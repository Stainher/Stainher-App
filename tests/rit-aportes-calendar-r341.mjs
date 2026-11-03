/* R341 - independent proposal date calendars on mobile and desktop. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {chromium} from "playwright";
import {resolve} from "node:path";
test("RIT proposal dates: no native date controls, independent selections",async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
  const page=await browser.newPage({viewport});
  await page.setContent('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><section id="page-liderazgo" style="width:100%;max-width:100%;box-sizing:border-box"></section></body></html>');
  await page.evaluate(()=>{
   window.state={session:{user:{id:"test"}},profile:{nombre:"Supervisor Test"}};
   window.__savedRIT=[];
   window.sb={from(name){
    if(name==="dotacion_contrato")return {select(){return {eq(){return {order(){return Promise.resolve({data:[{id:"a",nombre:"Técnico A",cargo:"Técnico"}],error:null})}}}}}};
    if(name==="rit_reuniones")return {insert(payload){window.__savedRIT.push(payload);return {select(){return {single(){return Promise.resolve({data:{id:"saved",estado:"borrador"},error:null})}}}}}};
    throw Error("Unexpected table "+name);
   }};
  });
  await page.addScriptTag({path:resolve("assets/stainher-v1524-rit-r331.js")});
  await page.locator('[data-field="area"]').fill("Saladillo");
  await page.locator('[data-person="a"]').check();
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-risk="RF01"]').check();
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-activity="0"]').fill("Prueba preventiva");
  for(const item of ["Instructivos","Materiales","Herramientas","EPP"])
   await page.locator('[data-item="'+item+'"]').selectOption("si");
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-key="rf"]').selectOption("RF01");
  await page.locator('[data-key="riesgo"]').fill("Contacto");
  await page.locator('[data-key="consecuencia"]').fill("Quemadura");
  await page.locator('[data-key="controles"]').fill("Energía cero");
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator(".rt-steps").innerText(),/Etapa 5/);
  assert.equal(await page.locator('input[type="date"]').count(),0);
  const fields=page.locator(".rt-date-field");
  assert.equal(await fields.count(),4);
  for(const i of [0,1]){
   const field=fields.nth(i);
   await field.locator(".rt-date-toggle").click();
   const cal=field.locator(".rt-calendar");
   assert.equal(await cal.count(),1);
   const bounds=await Promise.all([field.boundingBox(),cal.boundingBox()]);
   assert.ok(bounds.every(Boolean));
   assert.ok(bounds[1].x>=bounds[0].x-1&&bounds[1].x+bounds[1].width<=bounds[0].x+bounds[0].width+1,"Calendar must fit field");
   const day=cal.locator('[data-date-day$="-15"]').first();
   await day.click();
  }
  assert.match(await fields.nth(0).locator("input").inputValue(),/^15-/);
  assert.match(await fields.nth(1).locator("input").inputValue(),/^15-/);
  await page.locator('[data-act="save"]').click();
  await page.waitForFunction(()=>window.__savedRIT.length===1);
  const saved=await page.evaluate(()=>window.__savedRIT[0]);
  assert.match(saved.aportes[0].fecha,/^\d{4}-\d{2}-15$/);
  assert.match(saved.aportes[1].fecha,/^\d{4}-\d{2}-15$/);
  assert.equal(saved.aportes[2]?.fecha,undefined);
  await page.close();
 }
 }finally{await browser.close()}
});