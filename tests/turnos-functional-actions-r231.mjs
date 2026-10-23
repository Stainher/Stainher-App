import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';

const direct=readFileSync('assets/stainher-turnos-direct-r18.js','utf8');
assert.match(direct,/pg==='turnos'\?directRender\(\):base\(pg\)/,'Navegación debe EJECUTAR el renderizador');
assert.doesNotMatch(direct,/v1524PublishTurns/,'No dejar una publicación ficticia sin manejador');
assert.match(direct,/data-r18-refresh/,'Existe acción efectiva de recarga');

mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const editable of [true,false]){
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.setContent('<!doctype html><html><body><main class="page" id="page-turnos"></main></body></html>');
   await page.evaluate(editable=>{
     window.__turnCalls={loads:0,base:[],events:[],edits:[],reports:0,imports:0,templates:0};
     window.state={turnYearV1512:2026,turnMonthV1512:10,v1520TurnTab:'malla',turnGroupV1512:''};
     window.canViewV11=pg=>pg==='turnos';
     window.v1520CanEdit=pg=>pg==='turnos'&&editable;
     window.v1514SetGlobalHeader=()=>{};
     window.v1523Renderer=pg=>{window.__turnCalls.base.push(pg);return 'base-render';};
     window.v1519RenderModule=pg=>{window.__turnCalls.base.push('legacy:'+pg);return 'legacy-render';};
     window.v1520OpenShiftCell=(uid,date)=>window.__turnCalls.edits.push([uid,date]);
     window.v1520OpenTurnEvent=(id)=>window.__turnCalls.events.push(['open',id??null]);
     window.v1520DeleteTurnEvent=id=>window.__turnCalls.events.push(['delete',id]);
     window.v1514DownloadTurnTemplate=()=>window.__turnCalls.templates++;
     window.v1514OpenTurnImport=()=>window.__turnCalls.imports++;
     window.v1516OpenTurnMonthlyReport=()=>window.__turnCalls.reports++;
     window.v1520LoadTurnData=async()=>{
       window.__turnCalls.loads++;
       return {range:{start:'2026-10-01',end:'2026-10-31'},
         people:[{user_id:'p1',nombre:'Persona Prueba',cargo:'Supervisor',estado:'activo'}],
         groups:[['supervisor','Grupo A']],
         shifts:[{user_id:'p1',fecha:'2026-10-01',turno_base:'A'}],
         events:[{id:'event-1',user_id:'p1',fecha_inicio:'2026-10-01',fecha_fin:'2026-10-01',
           tipo:'hora_extra',cantidad:4,unidad:'horas',motivo:'Prueba',created_by:'u1'}],
         profiles:new Map([['u1','Administrador']])};
     };
   },editable);
   await page.addScriptTag({content:direct});
   await page.evaluate(async()=>{await window.v1523Renderer('turnos');});
   assert.equal(await page.locator('.r18-person-name').first().textContent(),'Persona Prueba');
   assert.equal(await page.locator('.r18-event-code').first().textContent(),'HE');
   assert.equal(await page.locator('[data-r18-publish]').count(),0,'El botón ficticio debe desaparecer');
   const counts=await page.evaluate(()=>window.__turnCalls);
   assert.equal(counts.loads,1,'La ruta de navegación debe invocar carga de datos');
   assert.equal(await page.evaluate(()=>window.v1523Renderer('otro')),'base-render','Las demás páginas mantienen su renderizador');
   if(editable){
     const selector=width<900?'.r18-mobile-day[data-r18-date="2026-10-01"]':'.r18-turn-cell[data-r18-date="2026-10-01"]';
     await page.locator(selector).first().click();
     await page.locator('[data-r18-new]').click();
     await page.locator('[data-r18-template]').click();
     await page.locator('[data-r18-import]').click();
     await page.locator('[data-r18-report]').click();
     await page.locator('[data-r18-refresh]').click();
     await page.locator('[data-r18-tab="novedades"]').click();
     assert.equal(await page.locator('[data-r18-edit-event]').count(),1);
     await page.locator('[data-r18-edit-event]').click();
     await page.locator('[data-r18-delete-event]').click();
     const c=await page.evaluate(()=>window.__turnCalls);
     assert.deepEqual(c.edits[0],['p1','2026-10-01']);
     assert.deepEqual(c.events,[['open',null],['open','event-1'],['delete','event-1']]);
     assert.equal(c.templates,1);assert.equal(c.imports,1);assert.equal(c.reports,1);
     assert.ok(c.loads>=3,'Refrescar y cambiar pestaña deben recargar datos');
   }else{
     assert.equal(await page.locator('[data-r18-new],[data-r18-template],[data-r18-import],[data-r18-refresh]').count(),0);
     await page.locator('[data-r18-report]').click();
     await page.locator('[data-r18-tab="novedades"]').click();
     assert.equal(await page.locator('[data-r18-edit-event],[data-r18-delete-event]').count(),0);
     const c=await page.evaluate(()=>window.__turnCalls);
     assert.equal(c.edits.length,0);
     assert.equal(c.reports,1);
   }
   await page.screenshot({path:'artifacts/r231-turnos-actions-'+(editable?'editor':'lector')+'-'+width+'.png',fullPage:true});
   console.log('PASS R231',editable?'editor':'lector',width);
   await page.close();
  }
 }
}finally{await browser.close();}
