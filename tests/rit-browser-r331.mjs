/* R331 · Prueba funcional de interfaz aislada en Chromium. */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {resolve} from "node:path";
import {showRITFormInModal} from "./helpers/rit-modal-fixture.mjs";

test("RIT: monta, selecciona asistentes, evalúa actividad y guarda borrador",async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<html><head></head><body><section id="page-liderazgo"></section></body></html>');
  await page.evaluate(()=>{
   window.state={session:{user:{id:"11111111-1111-1111-1111-111111111111"}},profile:{nombre:"Supervisor de Prueba"}};
   window.__savedRIT=[];
   window.sb={from(table){
    if(table==="dotacion_contrato")return {select(){return {eq(){return {order(){return Promise.resolve({data:[
     {id:"a",nombre:"Técnico A",cargo:"Técnico"},{id:"b",nombre:"Técnico B",cargo:"Técnico"}
    ],error:null})}}}}}};
    if(table==="rit_reuniones")return {insert(payload){window.__savedRIT.push(payload);return {select(){return {single(){return Promise.resolve({data:{id:"rit-test",estado:"borrador"},error:null})}}}}}};
    throw Error("Tabla inesperada "+table);
   }};
  });
  await page.addScriptTag({path:resolve("assets/stainher-v1524-rit-r331.js")});
  await showRITFormInModal(page);
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator("#rt-message").innerText(),/datos generales obligatorios/);
  assert.match(await page.locator(".rt-steps").innerText(),/Etapa 1/);
  await page.locator('[data-field="area"]').fill("Nodo 3700");
  await page.locator('[data-person="a"]').check();
  await page.locator('[data-person="b"]').check();
  assert.equal(await page.locator('[data-field="asistentes"]').inputValue(),"2");
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator("#rt-message").innerText(),/seleccionar los riesgos/);
  assert.match(await page.locator(".rt-steps").innerText(),/Etapa 2/);
  await page.locator('[data-risk="RF01"]').check();
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator("#rt-message").innerText(),/descripción/);
  await page.locator('[data-activity="0"]').fill("Monitoreo Jaula ASEA");
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator("#rt-message").innerText(),/marque Sí o No/);
  for(const item of ["Instructivos","Materiales","Herramientas","EPP"])
   await page.locator('[data-item="'+item+'"]').selectOption("si");
  await page.locator('[data-item="Materiales"]').selectOption("no");
  await page.locator('[data-act="next"]').click();
  assert.match(await page.locator("#rt-message").innerText(),/Materiales marcado No/);
  await page.locator('[data-item="Materiales"]').selectOption("si");
  await page.locator('[data-act="next"]').click();
  await page.locator('[data-key="rf"]').selectOption("RF01");
  await page.locator('[data-key="riesgo"]').fill("Contacto con energía eléctrica");
  await page.locator('[data-key="consecuencia"]').fill("Quemaduras");
  await page.locator('[data-key="controles"]').fill("Bloqueo y verificación de energía cero");
  await page.locator('[data-act="save"]').click();
  await page.waitForFunction(()=>window.__savedRIT.length===1);
  const item=await page.evaluate(()=>window.__savedRIT[0]);
  assert.equal(item.estado,"borrador");
  assert.equal(item.asistentes,2);
  assert.equal(item.participantes.length,2);
  assert.deepEqual(item.riesgos,["RF01"]);
  assert.equal(item.actividades[0].riesgos[0].rf,"RF01");
  assert.equal(item.actividades[0].preparacion.EPP,"si");
 }finally{await browser.close()}
});