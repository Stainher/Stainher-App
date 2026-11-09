import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const root='https://stainher.github.io/Stainher-App/';
const read=path=>readFileSync(path,'utf8');
const fixture=read('tests/fixtures/tv-r397-fixture.js');
const browser=await chromium.launch({headless:true});
let round=null,automatic=false,started=0,closedAt=null,now=Date.parse('2026-11-09T17:00:00Z');
const votes=new Map(),applauses=[],scores=new Map();
const bank=[
 {id:1,pregunta:'¿Qué palabra de cinco letras se lee igual en ambos sentidos?',categoria:'palabras',opciones:['Radar','Reloj','Radio'],correcta:1,explicacion:'Radar es un palíndromo.'},
 {id:2,pregunta:'¿Cuántos lados tiene un hexágono?',categoria:'trivia',opciones:['Cinco','Seis','Ocho'],correcta:2,explicacion:'Tiene seis lados.'},
];
function start(payload){
 round={...payload,id:'quiz-'+(++started),cierre:null,esperando:true,ganador:null};
 closedAt=null;
}
async function session({mobile=false,route='',signedIn=true,player='qa-worker'}={}){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1920,height:1080},isMobile:mobile,hasTouch:mobile});
 const page=await context.newPage();
 await page.exposeFunction('socialServer',async (op,payload)=>{
  const role=mobile?'tecnico':'administrador';
  const user=mobile?player:'qa-admin';
  if(op==='tv_social_banco')return {data:bank};
  if(op==='tv_social_modo'){
   automatic=payload.activar;
   if(automatic&&!round)start({...bank[0],segundos:payload.duracion});
   return {data:null};
  }
  if(['tv_social_ronda','tv_social_tv'].includes(op)){
   if(op==='tv_social_tv'&&automatic&&closedAt!==null&&now-closedAt>=12000)start({...bank[started%bank.length],segundos:round.segundos});
   const ended=round&&!round.esperando&&Date.parse(round.cierre)<=now;
   return {data:{ahora:new Date(now).toISOString(),automatico:automatic,ronda:round&&{
    ...round,correcta:ended?round.correcta:null,explicacion:ended?round.explicacion:null,
   },marcador:[...scores].map(([nombre,puntos])=>({nombre,puntos}))}};
  }
  if(op==='tv_social_iniciar'){
   if(role!=='administrador')return {error:{message:'Solo Administración'}};
   start(payload);
   return {data:round.id};
  }
  const {table,method,values,filters}=payload;
  if(table==='tv_social_respuestas'){
   const key=`${user}:${values?.desafio_id||filters.desafio_id}`;
   if(method==='insert'){
    votes.set(key,values.opcion);
    if(round.esperando){
     round.esperando=false;
     round.cierre=new Date(now+round.segundos*1000).toISOString();
    }
    if(values.opcion===round.correcta){
     round.ganador='Ana QA';
     round.cierre=new Date(now).toISOString();
     closedAt=now;
     scores.set('Ana QA',(scores.get('Ana QA')||0)+1);
    }
   }
   return {data:votes.has(key)?{opcion:votes.get(key)}:null};
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
   const signInForTest=()=>{state.session={user:{id:${JSON.stringify(mobile?player:'qa-admin')}}};state.profile={activo:true,rol:${JSON.stringify(role)}}};
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
 await manager.getByLabel('Banco de preguntas').selectOption('2');
 assert.match(await manager.getByLabel('Pregunta',{exact:true}).inputValue(),/hexágono/);
 await manager.getByLabel('Duración').selectOption('60');
 await manager.getByRole('button',{name:'Iniciar juego automático'}).click();
 await manager.waitFor({state:'hidden'});
 await tv.locator('[data-tv-social="desafio"]').getByText(/palabra de cinco letras/).waitFor();
 assert.equal(await tv.locator('[data-tv-social] img').count(),2);
 assert.equal(await tv.locator('.tv-social-answer').count(),0);

 const quiz=await session({mobile:true,route:'?mural=desafio',signedIn:false});
 assert.equal(await quiz.getByRole('dialog').count(),0,'El QR espera el inicio de sesión');
 await quiz.evaluate(()=>loginForTest());
 assert.equal(await quiz.locator('#stainher-tv-open').count(),0,'El perfil técnico no accede a la administración de TV');
 await quiz.getByText('Esperando la primera respuesta').waitFor();
 await tv.getByRole('button',{name:'Iniciar rotación'}).click();
 now+=120000;
 await tv.clock.runFor(26000);
 assert.equal(await tv.locator('[data-tv-title]').textContent(),'Pausa de oficina');
 assert.equal(round.cierre,null);
 await quiz.getByRole('radio',{name:'B. Reloj'}).check();
 await quiz.getByRole('button',{name:'Enviar respuesta'}).click();
 await quiz.getByText('Tu respuesta quedó registrada.').waitFor();
 assert.equal(votes.get('qa-worker:quiz-1'),2);
 assert.equal(await quiz.locator('.tv-social-answer').count(),0);
 await tv.clock.runFor(4000);
 assert.match(await tv.locator('[data-social-countdown]').innerText(),/^\d:\d{2}$/);

 const winner=await session({mobile:true,route:'?mural=desafio',player:'qa-winner'});
 await winner.getByRole('radio',{name:'A. Radar'}).check();
 await winner.getByRole('button',{name:'Enviar respuesta'}).click();
 await winner.getByText(/Ganó Ana QA/).waitFor();
 await tv.clock.runFor(5000);
 await tv.getByText('Solución · A. Radar').waitFor();
 assert.match(await tv.locator('.tv-social-score').innerText(),/Ana QA.*1 punto/);
 now+=13000;
 await tv.clock.runFor(5000);
 await tv.locator('[data-tv-social="desafio"]').getByText(/Cuántos lados tiene un hexágono/).waitFor();
 await winner.getByRole('radio',{name:'B. Seis'}).waitFor({timeout:10000});
 assert.match(await tv.locator('.tv-social-score').innerText(),/Ana QA.*1 punto/);

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
