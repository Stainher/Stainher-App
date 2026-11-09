import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const src=readFileSync('assets/stainher-v1524-home-reminders-r361.js','utf8');
const html=readFileSync('index.html','utf8');
const start=html.indexOf('let homeAlertsRenderVersion=0;');
const end=html.indexOf(';renderHomeAlertsV77=renderHomeAlertsV95;',start);
assert.ok(start>=0&&end>start,'Se usa el renderizador de alertas de Inicio');
assert.match(html,/<script defer src="stainher-v1524-home-reminders-r361\.js\?build=/);

const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  await page.setContent('<section id="page-inicio"><details open><summary>Alertas y próximos hitos</summary><div id="homeImpactAlerts"></div></details></section>');
  await page.addScriptTag({content:`
   window.__reminderWrites=[];
   window.preview=false;
   window.failReminder=true;
   let reminder;
   const sb={rpc:async(name,payload)=>{
    if(name==='crear_recordatorio_v153'){
     window.__reminderWrites.push({name,payload});
     if(window.failReminder)return {error:{message:'Falla simulada'}};
     reminder={id:'0c96f021-2941-4420-97b1-d9b2339e1e94',titulo:payload.p_titulo,descripcion:payload.p_descripcion,
      fecha_evento:payload.p_fecha_evento,tipo:payload.p_tipo,visibilidad:payload.p_visibilidad};
     return {data:reminder.id};
    }
    return {data:name==='recordatorios_visibles_v153'&&reminder?[reminder]:[]};
   }};
   var v152AlertFilter='todas';
   const CHILE_HOLIDAYS=[],V13_EXP_FIELDS=[];
   const v1512AlertDotacionRows=async()=>[];
   const v95TextDate=String,v95Days=()=>10,v1518Weekday=()=>'',v152AlertLevel=()=>'',v153ScopeLabel=String,esc=String;
   const isAdmin=()=>true;
   window.v15MutationBlocked=()=>window.preview;
   window.toast=message=>{window.lastMessage=message};
   window.renderHomeAlertsV95=null;
   ${html.slice(start,end)};
  `});
  await page.addScriptTag({content:src});
  await page.evaluate(()=>window.renderHomeAlertsV95());
  const add=page.getByRole('button',{name:'+ Nuevo recordatorio / alerta'});
  await add.scrollIntoViewIfNeeded();
  const button=await add.boundingBox();
  assert.ok(button);
  await page.mouse.move(button.x+button.width/2,button.y+button.height/2);
  await page.mouse.down();
  await page.evaluate(()=>window.renderHomeAlertsV95());
  await page.mouse.up();

  const form=page.locator('#r361-form');
  await form.waitFor();
  assert.equal(await page.evaluate(()=>window.sb),undefined,'El formulario funciona antes del puente de módulos');
  const nextYear=await page.evaluate(()=>new Date().getFullYear()+1);
  const date=nextYear+'-01-15';
  await form.getByLabel('Título').fill('Revisión de inspección');
  await form.getByLabel('Fecha del evento').fill(date);
  await form.getByLabel('Descripción').fill('Confirmar equipos');
  await form.getByLabel('Visibilidad').selectOption('personal');
  await form.getByRole('button',{name:'Guardar recordatorio'}).click();
  await form.getByRole('alert').filter({hasText:'Falla simulada'}).waitFor();
  assert.equal(await form.getByLabel('Título').inputValue(),'Revisión de inspección');
  await page.evaluate(()=>{window.failReminder=false});
  await form.getByRole('button',{name:'Guardar recordatorio'}).click();
  await form.waitFor({state:'detached'});
  await page.getByText('Revisión de inspección',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Recordatorios',exact:true}).evaluate(node=>node.classList.contains('primary')),true);
  const calls=await page.evaluate(()=>window.__reminderWrites);
  assert.equal(calls.length,2);
  assert.deepEqual(calls[1],{
   name:'crear_recordatorio_v153',payload:{
    p_titulo:'Revisión de inspección',p_descripcion:'Confirmar equipos',p_fecha_evento:date,
    p_tipo:'recordatorio',p_prioridad:'normal',p_visibilidad:'personal',
   },
  });
  await page.evaluate(()=>{window.preview=true});
  await add.focus();
  await page.keyboard.press('Enter');
  await form.getByRole('alert').filter({hasText:'Modo prueba'}).waitFor();
  assert.equal(await form.getByRole('button',{name:'Guardar recordatorio'}).isDisabled(),true);
  await page.keyboard.press('Escape');
  await form.waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>window.__reminderWrites.length),2);
  await page.close();
 }
}finally{await browser.close()}
console.log('Recordatorios: botón estable durante el refresco, reintento, guardado y listado del próximo año en escritorio y móvil.');
