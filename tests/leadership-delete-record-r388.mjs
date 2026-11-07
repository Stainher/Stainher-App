import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const runtime=readFileSync('assets/stainher-v1524-leadership-indicators-r387.js','utf8');
const sql=readFileSync('supabase/migrations/20261106234500_liderazgo_delete_records_r388.sql','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(runtime);
assert.match(loader,/stainher-leadership-indicators-r388/);
assert.match(runtime,/eliminar_control_liderazgo_r388/);
assert.match(sql,/v_reg\.created_by = v_uid/);
assert.match(sql,/auditoria_v1512/);
assert.match(sql,/grant execute .* to authenticated/);
assert.doesNotMatch(runtime,/new\s+MutationObserver\s*\(|setInterval\s*\(/);

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<section id="page-liderazgo"><div id="v1512Lead_indicadores"><div class="panel"><h3>Cumplimiento por usuario</h3></div><div class="panel"><h3>Controles realizados</h3></div></div></section>');
 await page.evaluate(()=>{
  const row=(id,by,nombre)=>({
   id,created_by:by,fecha:'2026-11-06',created_at:'2026-11-06T22:30:00Z',
   supervisor_nombre:nombre,supervisor_user_id:by,
   ejecutado_por_nombre:nombre,ejecutado_por_user_id:by,
   control_codigo:'CTRL-05',control_nombre:'Check List de Extintores',
   fuera_programacion:true,estado:'realizado'
  });
  window.__rows=[
   row('11111111-1111-4111-8111-111111111111','supervisor-1','Cristian Flores'),
   row('22222222-2222-4222-8222-222222222222','supervisor-2','Luis Rojas')
  ];
  window.__calls=0;window.__refreshes=0;window.__confirmed=false;
  window.state={leadershipYear:2026,leadershipMonth:11,session:{user:{id:'supervisor-1'}},profile:{rol:'supervisor'}};
  window.v11Role=()=>window.state.profile.rol;
  window.canEditV11=()=>window.state.profile.rol==='administrador';
  window.renderLiderazgoV95=async()=>{window.__refreshes++};
  window.toast=()=>{};
  window.confirm=()=>window.__confirmed;
  window.sb={
   rpc:async(name,args)=>{
    window.__calls++;
    if(name!=='eliminar_control_liderazgo_r388'||!args?.p_id)throw Error('RPC inesperada');
    window.__rows=window.__rows.filter(r=>r.id!==args.p_id);
    return {data:true,error:null};
   },
   from(table){
    const builder={
     select(){return this},eq(){return this},order(){return this},limit(){return this},
     then(resolve,reject){
      return Promise.resolve({
       data:table==='liderazgo_cumplimiento'?[...window.__rows]:[],error:null
      }).then(resolve,reject);
     }
    };
    return builder;
   }
  };
 });
 await page.addScriptTag({content:runtime});
 assert.equal(await page.evaluate(()=>window.StainherLeadershipIndicatorsR387.refresh(true)),true);
 assert.equal(await page.locator('[data-r387="records"] .r387-card').count(),2);
 assert.equal(await page.locator('[data-r388-delete]').count(),1,'Un supervisor solo puede borrar un registro propio');
 await page.locator('[data-r388-delete]').click();
 assert.equal(await page.evaluate(()=>window.__calls),0,'Cancelar confirmación no ejecuta RPC');

 await page.evaluate(()=>window.__confirmed=true);
 await page.locator('[data-r388-delete]').click();
 await page.waitForFunction(()=>document.querySelector('[data-r387="records"]')?.textContent.includes('Registros visibles: 1'));
 assert.equal(await page.evaluate(()=>window.__calls),1,'Una sola llamada para eliminar el registro elegido');
 assert.equal(await page.evaluate(()=>window.__refreshes),1,'Se actualizó el resumen existente');
 assert.equal(await page.locator('[data-r388-delete]').count(),0,'No se permite eliminar otro registro siendo supervisor');
 assert.equal(await page.locator('[data-r387-download]').count(),1,'El botón PDF sigue disponible');

 await page.evaluate(()=>{
  window.state.profile.rol='administrador';
  window.state.session.user.id='admin-1';
 });
 assert.equal(await page.evaluate(()=>window.StainherLeadershipIndicatorsR387.refresh(true)),true);
 assert.equal(await page.locator('[data-r388-delete]').count(),1,'Administrador puede gestionar registros autorizados');
 await page.close();
}finally{await browser.close()}
console.log('R388: eliminar solo propios o con permisos; cancelación, actualización y PDF verificados');
