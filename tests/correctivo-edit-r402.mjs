import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const html=readFileSync('index.html','utf8');
const editor=readFileSync('assets/stainher-correctivo-edit-r402.js','utf8');
const mobile=readFileSync('assets/stainher-correctivo-r10.js','utf8');
const history=readFileSync('assets/stainher-v1524-corrective-history-r118.js','utf8');
const disclosure=readFileSync('assets/stainher-v1524-collapsible.js','utf8');
const supervisor=readFileSync('assets/stainher-supervisor-correctivo-r12.js','utf8');
const core=html.slice(html.indexOf('function parseHora('),html.indexOf('function pickRaw('));
const start=html.indexOf('renderCorrectivo=function(j){\n  let all=');
const renderer=html.slice(start,html.indexOf('// Usuarios: incorporar rol Confiabilidad',start));
assert.ok(core.includes('function calcDuracionMin')&&renderer.includes('data-corr-edit-id'));
assert.match(html,/<script defer src="stainher-correctivo-edit-r402\.js\?build=/);

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.setContent('<style>.hidden{display:none}</style><div id="appView"><section class="page" id="page-correctivo"><select id="corrEquipo"><option value="">Todos</option></select><div id="corrBody"></div></section></div>');
 await page.evaluate(()=>{
  window.row={id:'averia-1',equipo_id:null,equipo_original:'Equipo importado',numero_guia:'401',
   supervisor_tecnico:'Responsable inicial',fecha_inicio:'2026-11-08',hora_inicio:'23:00',fecha_termino:'2026-11-09',
   hora_termino:'01:00',duracion_minutos:120,estado_final:'Operativo',observaciones:'Subsistema: Control\n<observación original>',
   clave_unica:'r364-import-1',fecha_hora_falla:'2026-11-08T23:00:00',fecha_hora_restitucion:'2026-11-09T01:00:00',
   excluir_kpi:true,importacion_id:'import-1'};
  window.writes=[];
  window.$=selector=>document.querySelector(selector);
  window.state={session:{user:{id:'test'}},profile:{rol:'administrador',activo:true},correctivoYear:2026,correctivoMonth:11,
   equipos:[{id:'equipo-1',nombre:'Nodo 3700',estado:'activo'}],charts:{}};
  window.v11Role=()=>state.profile.rol;
  window.v1520CanEdit=()=>!state.v15PreviewRole&&state.profile.permisos?.correctivo!=='ver';
  window.canManageReliabilityV8=()=>v11Role()==='administrador';
  window.esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.fmtH=value=>Number(value).toFixed(1)+' h';
  window.calcReliabilityKpis=()=>({ready:false});
  window.calcTrendMensual=()=>[];
  window.Chart=class {};
  window.toast=message=>{window.notice=message};
  window.renderRows=()=>renderCorrectivo({rows:[{...row,equipo:row.equipo_original,guia:row.numero_guia,
   responsable:row.supervisor_tecnico,duracion_horas:row.duracion_minutos/60,estado_normalizado:row.estado_final}]});
  window.loadCorrectivo=async()=>renderRows();
  window.renderCorrectivoShell=()=>{};
  window.sb={from(table){
   if(table!=='averias')throw Error('Tabla inesperada');
   let patch;
   const filters={};
   const query={
    update(value){patch=value;return query},
    select(){return query},
    eq(key,value){filters[key]=value;return query},
    is(key,value){filters[key]=value;return query},
    gte(){return query},lte(){return query},order(){return query},
    then(resolve,reject){return Promise.resolve({data:[{...row}]}).then(resolve,reject)},
    async maybeSingle(){
     if(!Object.entries(filters).every(([key,value])=>(row[key]??null)===value))return {data:null};
     if(!patch)return {data:{...row}};
     writes.push(patch);
     Object.assign(row,patch);
     return {data:{id:row.id}};
    },
   };
   return query;
  }};
 });
 await page.addScriptTag({content:core+'\n'+renderer+'\n'+editor});
 await page.evaluate(()=>renderRows());
 await page.addScriptTag({content:disclosure+'\n'+history});
 const historySummary=page.locator('summary').filter({hasText:'Historial del período'});
 await historySummary.click();
 const form=page.locator('[data-corr-edit-form]');
 const edit=()=>page.getByRole('button',{name:'Editar',exact:true}).click();
 const save=()=>form.getByRole('button',{name:'Guardar cambios'}).click();
 await edit();
 assert.equal(await form.getByLabel('Observaciones').inputValue(),'Subsistema: Control\n<observación original>');
 assert.equal(await form.getByLabel('Equipo',{exact:true}).locator('option:checked').textContent(),'Equipo importado');
 await form.getByLabel('Fecha de término').fill('2026-11-08');
 await save();
 await form.getByRole('alert').filter({hasText:'El término no puede ser anterior al inicio.'}).waitFor();
 assert.equal(await page.evaluate(()=>writes.length),0);
 await form.getByLabel('Fecha de término').fill('2026-11-09');
 await form.getByLabel('Hora de término').fill('02:15');
 await form.getByLabel('Observaciones').fill('Subsistema: Control\nNueva observación');
 await save();
 await form.waitFor({state:'detached'});
 await page.getByText('3.3 h',{exact:true}).waitFor();
 assert.equal(await historySummary.evaluate(summary=>summary.parentElement.open),true);
 assert.deepEqual(await page.evaluate(()=>writes[0]),{
  observaciones:'Subsistema: Control\nNueva observación',hora_termino:'02:15',duracion_minutos:195,fecha_hora_restitucion:'2026-11-09T02:15:00',
 });
 assert.equal(await page.evaluate(()=>row.excluir_kpi&&row.clave_unica==='r364-import-1'),true);
 await edit();
 await form.getByLabel('Observaciones').fill('Mi edición');
 await page.evaluate(()=>{row.observaciones='Edición de otra sesión'});
 await save();
 await form.getByRole('alert').filter({hasText:'El registro cambió'}).waitFor();
 await form.getByRole('button',{name:'Cancelar'}).click();
 assert.equal(await page.evaluate(()=>writes.length),1);

 await page.setViewportSize({width:390,height:844});
 await page.addScriptTag({content:mobile});
 await page.locator('.stainher-corr-mobile-cards-r10').getByRole('button',{name:'Editar',exact:true}).click();
 await form.getByLabel('Responsable').fill('Responsable actualizado');
 await save();
 await page.locator('.stainher-corr-mobile-cards-r10').getByText('Responsable actualizado',{exact:true}).waitFor();

 await page.evaluate(()=>{state.v15PreviewRole='administrador';renderRows()});
 assert.equal(await page.locator('table [data-corr-edit-id]').count(),0);
 await page.evaluate(()=>{state.v15PreviewRole=null;state.profile={rol:'supervisor',permisos:{correctivo:'editar'}}});
 await page.addScriptTag({content:supervisor});
 await page.locator('.corr-r12-card').getByRole('button',{name:'Editar',exact:true}).click();
 await form.getByLabel('N.º de guía').fill('402');
 await save();
 await page.locator('.corr-r12-card').getByText('402',{exact:true}).waitFor();
 await page.evaluate(async()=>{state.profile.permisos.correctivo='ver';await loadCorrectivo()});
 assert.equal(await page.locator('.corr-r12-card [data-corr-edit-id]').count(),0);
}finally{await browser.close()}
console.log('R402: edición en escritorio, tarjeta móvil y Supervisor, permisos, duración y conflicto concurrente.');
