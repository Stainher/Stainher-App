import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const root='https://stainher.github.io/Stainher-App/';
const read=path=>readFileSync(path,'utf8');
const fixture=read('tests/fixtures/tv-r397-fixture.js');
const browser=await chromium.launch({headless:true});
let round=null,now=Date.parse('2026-11-09T17:00:00Z');
const votes=new Map(),applauses=[];
async function session({mobile=false,route='',signedIn=true}={}){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1920,height:1080},isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage();
 await page.exposeFunction('socialServer',async (op,payload)=>{
  const role=mobile?'tecnico':'administrador';
  const user=mobile?'qa-worker':'qa-admin';
  if(op==='tv_social_ronda')return {data:{ahora:new Date(now).toISOString(),ronda:round&&{
   ...round,correcta:Date.parse(round.cierre)<=now?round.correcta:null,explicacion:Date.parse(round.cierre)<=now?round.explicacion:null,
  }}};
  if(op==='tv_social_iniciar'){
   if(role!=='administrador')return {error:{message:'Solo Administración'}};
   round={...payload,id:'quiz-1',cierre:new Date(now+payload.segundos*1000).toISOString()};
   return {data:round.id};
  }
  const {table,method,values,filters}=payload;
  if(table==='tv_social_respuestas'){
   if(method==='insert')votes.set(user,values.opcion);
   return {data:votes.has(user)?{opcion:votes.get(user)}:null};
  }
  if(method==='insert')applauses.push({...values,estado:'pendiente'});
  if(method==='update'&&role==='administrador'){
   const row=applauses.find(row=>row.id===filters.id&&row.estado===filters.estado);
   if(!row)return {data:[]};
   row.estado=values.estado;
   return {data:[{id:row.id}]};
  }
  return {data:applauses.filter(row=>row.estado===filters.estado&&(role==='administrador'||row.estado==='publicado'))};
 });
 await page.route(root+'**',req=>{
  const url=new URL(req.request().url());
  const asset=url.pathname.split('/assets/')[1];
  if(asset){
   const kind=asset.endsWith('.svg')?'image/svg+xml':asset.endsWith('.css')?'text/css':'application/javascript';
   return req.fulfill({body:read('assets/'+asset),contentType:kind});
  }
  const role=mobile?'tecnico':'administrador';
  const stub=`
   const fromFixture=sb.from;
   const signInForTest=()=>{state.session={user:{id:${JSON.stringify(mobile?'qa-worker':'qa-admin')}}};state.profile={activo:true,rol:${JSON.stringify(role)}}};
   ${signedIn?'signInForTest();':'state.session=null;state.profile=null;'}
   window.loginForTest=()=>{signInForTest();document.getElementById('appView').classList.add('signed-in')};
   sb.rpc=(name,values)=>socialServer(name,values);
   sb.from=table=>{
    if(!['tv_social_respuestas','tv_social_aplausos'].includes(table))return fromFixture(table);
    let method='read',values;const filters={};
    const get=()=>socialServer('table',{table,method,values,filters});
    const query={select:()=>query,eq:(key,v)=>{filters[key]=v;return query},order:()=>query,limit:()=>query,
     insert:v=>{method='insert';values=v;return query},update:v=>{method='update';values=v;return query},
     maybeSingle:get,then:(resolve,reject)=>get().then(resolve,reject)};
    return query;
   };
  `;
  return req.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html lang="es"><meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="assets/stainher-tv-r397.css"><link rel="stylesheet" href="assets/stainher-tv-social-r413.css">
  <div id="appView"><aside class="sidebar"><nav class="nav"></nav></aside><p id="qa-status"></p></div>
  <script>${fixture}\n${stub}</script><script defer src="assets/stainher-tv-social-r413.js"></script><script defer src="assets/stainher-tv-r397.js"></script></html>`});
 });
 await page.goto(root+route);
 return page;
}
try{
 const tv=await session();
 await tv.clock.install();
 await tv.getByRole('button',{name:/Diario mural/}).click();
 await tv.getByRole('button',{name:'Pausa de oficina'}).click();
 await tv.getByText('El próximo desafío aparecerá aquí',{exact:false}).waitFor();
 await tv.getByRole('button',{name:'Gestionar dinámicas'}).click();
 const manager=tv.getByRole('dialog',{name:'Gestionar dinámicas'});
 await manager.getByRole('button',{name:'Cargar un ejemplo'}).click();
 await manager.getByLabel('Duración').selectOption('60');
 await manager.getByRole('button',{name:'Iniciar en la TV'}).click();
 await tv.getByText(/palabra de cinco letras/).waitFor();
 assert.equal(await tv.locator('[data-tv-social] img').count(),2);
 assert.equal(await tv.locator('.tv-social-answer').count(),0);

 const quiz=await session({mobile:true,route:'?mural=desafio',signedIn:false});
 assert.equal(await quiz.getByRole('dialog').count(),0,'El QR espera el inicio de sesión');
 await quiz.evaluate(()=>loginForTest());
 assert.equal(await quiz.locator('#stainher-tv-open').count(),0,'El perfil técnico no accede a la administración de TV');
 await quiz.getByRole('radio',{name:'A. Radar'}).check();
 await quiz.getByRole('button',{name:'Enviar respuesta'}).click();
 await quiz.getByText('Tu respuesta quedó registrada.').waitFor();
 assert.equal(votes.get('qa-worker'),1);
 assert.equal(await quiz.locator('.tv-social-answer').count(),0);

 await tv.getByRole('button',{name:'Iniciar rotación'}).click();
 await tv.clock.runFor(26000);
 assert.equal(await tv.locator('[data-tv-title]').textContent(),'Pausa de oficina','La rotación espera el cierre del desafío');
 now=Date.parse(round.cierre)+1000;
 await tv.clock.runFor(5000);
 await tv.getByText('Solución · A. Radar').waitFor();
 await quiz.getByText('Solución · A. Radar').waitFor({timeout:10000});

 const phone=await session({mobile:true,route:'?mural=aplausos'});
 await phone.getByLabel('¿A quién va dirigido?').fill('Equipo QA');
 await phone.getByLabel('Tu agradecimiento').fill('Gracias por ayudar <img src=x>');
 await phone.getByRole('button',{name:'Enviar aplauso'}).click();
 await phone.getByText('Aplauso enviado para revisión.').waitFor();
 assert.equal(applauses[0].estado,'pendiente');
 assert.equal(await tv.getByText('Para Equipo QA').count(),0);
 await tv.getByRole('button',{name:'Gestionar dinámicas'}).click();
 await manager.getByRole('button',{name:'Publicar',exact:true}).click();
 assert.equal(applauses[0].estado,'publicado');
 await manager.getByRole('button',{name:'Cerrar',exact:true}).click();
 await tv.locator('[data-tv-social="aplausos"]').getByRole('heading',{name:'Para Equipo QA'}).waitFor();
 assert.equal(await tv.locator('.tv-social-applause img').count(),0);
 assert.equal(await tv.locator('.tv-social-applause blockquote').textContent(),'Gracias por ayudar <img src=x>');
 await tv.getByRole('button',{name:'Gestionar dinámicas'}).click();
 await manager.getByRole('button',{name:'Retirar',exact:true}).click();
 await manager.getByText('Bandeja actualizada.').waitFor();
 assert.equal(applauses[0].estado,'retirado');
}finally{await browser.close()}
console.log('Pausa de oficina: QR y acceso móvil, desafío con tiempo y solución, aprobación y retiro de aplausos.');
