import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const src=fs.readFileSync('assets/stainher-v1524-home-reminders-r361.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const button=html.match(/<button[^>]+>\+ Nuevo recordatorio \/ alerta<\/button>/)?.[0];
assert.ok(button);
assert.match(html,/<script defer src="stainher-v1524-home-reminders-r361\.js\?build=/);

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<section id="page-inicio">'+button+'</section>');
 await page.addScriptTag({content:`
  window.__reminderWrites=[];
  window.preview=false;
  window.failReminder=true;
  const sb={rpc:async(name,payload)=>{
   window.__reminderWrites.push({name,payload});
   if(window.failReminder)return {error:{message:'Falla simulada'}};
   return {data:'0c96f021-2941-4420-97b1-d9b2339e1e94'};
  }};
  window.renderHomeAlertsV95=async()=>{window.__renderedReminders=true};
  window.v15MutationBlocked=()=>window.preview;
  window.toast=message=>{window.lastMessage=message};
  window.openReminderV95=()=>{throw new Error('Se llamó al formulario anterior')};
 `});
 await page.addScriptTag({content:src});
 const add=page.getByRole('button',{name:'+ Nuevo recordatorio / alerta'});
 await add.click();
 const form=page.locator('#r361-form');
 await form.waitFor();
 assert.equal(await page.evaluate(()=>window.sb),undefined,'El formulario funciona antes del puente de módulos');
 await form.locator('[name="titulo"]').fill('Revisión de inspección');
 await form.locator('[name="fecha_evento"]').fill('2026-11-12');
 await form.locator('[name="descripcion"]').fill('Confirmar equipos');
 await form.locator('.r361-save').click();
 await form.getByRole('alert').filter({hasText:'Falla simulada'}).waitFor();
 assert.equal(await form.locator('[name="titulo"]').inputValue(),'Revisión de inspección');
 await page.evaluate(()=>{window.failReminder=false});
 await form.locator('.r361-save').click();
 await form.waitFor({state:'detached'});
 await page.waitForFunction(()=>window.__renderedReminders);
 const calls=await page.evaluate(()=>window.__reminderWrites);
 assert.equal(calls.length,2);
 assert.deepEqual(calls[1],{
  name:'crear_recordatorio_v153',payload:{
   p_titulo:'Revisión de inspección',p_descripcion:'Confirmar equipos',p_fecha_evento:'2026-11-12',
   p_tipo:'recordatorio',p_prioridad:'normal',p_visibilidad:'todos',
  },
 });
 await page.evaluate(()=>{window.preview=true});
 await add.click();
 assert.equal(await form.count(),0);
 assert.match(await page.evaluate(()=>window.lastMessage),/Modo prueba/);
}finally{await browser.close()}
console.log('Recordatorios: botón de Inicio, cliente disponible desde el arranque, reintento y recarga de alertas.');
