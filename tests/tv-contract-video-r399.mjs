import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const script=readFileSync('assets/stainher-tv-r397.js','utf8');
const styles=readFileSync('assets/stainher-tv-r397.css','utf8');
const fixture=readFileSync('tests/fixtures/tv-r397-fixture.js','utf8');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 await page.clock.install({time:new Date('2026-11-22T15:00:00Z')});
 await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({body:'Prueba del reproductor'}));
 await page.route('https://fixture.invalid/**',route=>route.abort());
 await page.setContent('<!doctype html><html><head><base href="https://fixture.invalid/"></head><body><div id="appView"><aside class="sidebar"><nav class="nav"></nav></aside><p id="qa-status"></p></div></body></html>');
 await page.addStyleTag({content:styles});
 await page.addScriptTag({content:fixture});
 await page.evaluate(()=>{
  Object.assign(tables.contrato_datos[0],{nombre_servicio:'Servicio QA',valor_inicial:100000,valor_vigente:120000,dotacion_contractual:16});
  const expenses={
   gastos_reembolsables:[
    {id:'1',anio_edp:2026,mes_edp:11,monto_detalle:25000},
    {id:'2',anio_edp:2026,mes_edp:12,monto_detalle:35000},
    {id:'3',anio_edp:2026,mes_edp:1,monto_detalle:99999}
   ],
   gastos_operacionales_r342:[
    {id:'1',fecha:'2026-11-09',monto:6500,anulado:false},
    {id:'2',fecha:'2026-11-10',monto:9999,anulado:true},
    {id:'3',fecha:'2026-12-01',monto:99999,anulado:false},
    ...Array.from({length:500},(_,i)=>({id:'extra-'+i,fecha:'2026-11-01',monto:1,anulado:false}))
   ]
  };
  const from=sb.from;
  tvQA.expenseReads=0;
  tvQA.operativeDelta=0;
  sb.from=table=>{
   if(!expenses[table])return from(table);
   tvQA.expenseReads++;
   let rows=expenses[table];
   const query={
    select(){return query},order(){return query},
    gte(key,value){rows=rows.filter(row=>row[key]>=value);return query},
    lte(key,value){rows=rows.filter(row=>row[key]<=value);return query},
    lt(key,value){rows=rows.filter(row=>row[key]<value);return query},
    not(key,operator,value){assertOperator(operator);rows=rows.filter(row=>row[key]!==value);return query},
    range(from,to){
     const data=rows.slice(from,to+1).map(row=>table==='gastos_operacionales_r342'&&row.id==='1'
      ?{...row,monto:row.monto+tvQA.operativeDelta}:row);
     return Promise.resolve({data});
    }
   };
   function assertOperator(operator){if(operator!=='is')throw Error('Operador no previsto')}
   return query;
  };
 });
 await page.addScriptTag({content:script});
 await page.locator('#stainher-tv-open').click();
 await page.locator('#stainher-tv').waitFor();
 assert.equal(await page.evaluate(()=>tvQA.expenseReads),0);
 await page.locator('[data-tv-action="edit"]').click();
 await page.locator('[data-tv-action="add-screen"]').click();
 await page.locator('[name="title"]').fill('Administración del contrato');
 await page.locator('[data-tv-action="remove"]').click();
 for(const type of ['contrato','reembolsables','operativos','youtube']){
  await page.locator('[name="type"]').selectOption(type);
  await page.locator('[data-tv-action="add-widget"]').click();
 }
 const link=page.getByLabel('Enlace de YouTube');
 const search=page.getByRole('searchbox',{name:'Buscar en YouTube'});
 await page.evaluate(()=>{
  sb.functions={invoke:async()=>({error:{context:Response.json({error:'La búsqueda integrada requiere activar la conexión con YouTube.'},{status:503})}})};
 });
 await search.fill('Ascensores & rescate');
 await search.press('Enter');
 await page.getByText('La búsqueda integrada requiere activar la conexión con YouTube.').waitFor();
 const external=page.getByRole('link',{name:'Buscar en YouTube y copiar el enlace'});
 assert.equal(new URL(await external.getAttribute('href')).searchParams.get('search_query'),'Ascensores & rescate');
 assert.equal(await page.evaluate(()=>tvQA.writes),0);
 await page.evaluate(()=>{
  sb.functions.invoke=async(name,{body})=>{
   if(name!=='tv-youtube-search'||body.query!=='Seguridad Andina')throw Error('Solicitud inesperada');
   return {data:{items:[{id:'M7lc1UVf-VE',title:'Seguridad <Andina>',channel:'Canal QA'}]}};
  };
 });
 await link.fill('https://youtube.com.example.org/watch?v=M7lc1UVf-VE');
 await page.getByRole('button',{name:'Guardar pantallas'}).click();
 await page.getByText(/Ingresa un enlace válido de YouTube/).waitFor();
 assert.equal(await page.evaluate(()=>tvQA.writes),0);
 await search.fill('Seguridad Andina');
 await page.getByRole('button',{name:'Buscar videos'}).click();
 await page.getByRole('button',{name:'Seguridad <Andina> Canal QA'}).click();
 assert.equal(await link.inputValue(),'https://youtu.be/M7lc1UVf-VE');
 assert.equal(await page.evaluate(()=>tvQA.writes),0);
 await page.getByRole('button',{name:'Guardar pantallas'}).click();
 await page.locator('[data-tv-editor]').waitFor({state:'hidden'});
 await page.locator('.tv-type-operativos .tv-money').waitFor();
 const asNumber=async locator=>Number((await locator.innerText()).replace(/[^0-9]/g,''));
 assert.equal(await asNumber(page.locator('.tv-type-operativos .tv-money strong')),7000);
 assert.equal(await asNumber(page.locator('.tv-type-reembolsables .tv-money strong')),60000);
 assert.equal(await asNumber(page.locator('.tv-type-contrato .tv-bar b').last()),120000);
 const player=page.locator('.tv-youtube');
 const url=new URL(await player.getAttribute('src'));
 assert.equal(url.origin,'https://www.youtube-nocookie.com');
 for(const [key,value] of Object.entries({autoplay:'1',mute:'1',loop:'1',playlist:'M7lc1UVf-VE',playsinline:'1'})){
  assert.equal(url.searchParams.get(key),value);
 }
 await player.evaluate(node=>{window.originalVideo=node});
 await page.evaluate(()=>{tvQA.operativeDelta=1});
 await page.locator('[data-tv-action="refresh"]').click();
 await page.waitForFunction(()=>document.querySelector('.tv-type-operativos .tv-money strong')?.textContent.replace(/[^0-9]/g,'')==='7001');
 assert.equal(await player.evaluate(node=>node===window.originalVideo),true);
 await page.locator('[data-tv-action="close"]').click();
 await page.locator('#stainher-tv-open').click();
 await page.getByRole('button',{name:'Administración del contrato',exact:true}).click();
 assert.equal(await player.count(),1);
 assert.equal(await page.evaluate(()=>tvQA.saved.valor.screens.at(-1).widgets.at(-1).text),'https://youtu.be/M7lc1UVf-VE');
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#stainher-tv').evaluate(node=>node.scrollWidth<=node.clientWidth),true);
 console.log('R399: acceso mediante editor, agregados mensuales, anulados excluidos, URL validada, persistencia y reproducción conservada al actualizar.');
}finally{await browser.close()}
