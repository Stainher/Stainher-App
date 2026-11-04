import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const ui=fs.readFileSync('assets/stainher-v1524-correctivo-observaciones-r370.js','utf8');
const reader=fs.readFileSync('assets/stainher-v1524-correctivo-replace-r364.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const sql=fs.readFileSync('supabase/migrations/20261104183000_r370_actualizar_observaciones.sql','utf8');
new Function(ui);new Function(reader);new Function(loader);
assert.match(loader,/refreshObservacionesR370/);
assert.match(ui,/Actualizar observaciones de fallas existentes/);
assert.match(ui,/p_confirmar:false/);
assert.match(ui,/p_confirmar:true/);
assert.match(ui,/window\.prompt\('Para confirmar /);
assert.match(sql,/auditoria_observaciones_averias_r370/);
assert.match(sql,/pg_advisory_xact_lock/);
assert.match(sql,/security definer/i);
assert.match(sql,/observaciones=c\.item->>'nuevo'/);
test('R370 importación de observaciones desde modal legado',async()=>{
const browser=await chromium.launch({headless:true});
try{
 const p=await browser.newPage();
 await p.setContent('<html><body><section id="page-correctivo"><div id="corrBody"></div></section><div role="dialog" id="legacy">'+
  '<h2>Importar base de averías</h2><input id="legacy-file" type="file">'+
  '<div><button disabled>Importar 0 registros</button></div></div></body></html>');
 await p.evaluate(()=>{
  window.state={profile:{rol:'confiabilidad'},session:{user:{id:'test'}}};
  window.XLSX={read:()=>({SheetNames:['Averías'],Sheets:{Averías:{}}}),utils:{sheet_to_json:()=>[
   ['Equipo','Fecha Inicio','Hora Inicio','Observaciones'],
   ['JAULA ASEA','14-02-2026','19:40','Texto corregido']
  ]}};
  window.__rpcCalls=[];
  window.sb={rpc:async (name,args)=>{
   window.__rpcCalls.push({name,args});
   return {data:{total:1,actualizados:1,sin_cambios:0,sin_coincidencia:0,ambiguos:0,invalidos:0,ejemplos:[{equipo:'JAULA ASEA',fecha:'2026-02-14',antes:'Antiguo',despues:'Texto corregido'}]}};
  }};
  window.confirm=()=>true;window.prompt=()=> 'ACTUALIZAR';
 });
 await p.addScriptTag({content:reader});
 await p.addScriptTag({content:ui});
 assert.equal(await p.locator('#legacy [data-r370-update-observaciones]').count(),1,'Acción disponible en importador R19');
 await p.locator('#legacy-file').setInputFiles({name:'Fallos.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from('falso')});
 await p.locator('#legacy [data-r370-update-observaciones]').click();
 await p.waitForFunction(()=>window.__rpcCalls?.length===2);
 const calls=await p.evaluate(()=>window.__rpcCalls);
 assert.equal(calls[0].name,'actualizar_observaciones_averias_r370');
 assert.equal(calls[0].args.p_confirmar,false);
 assert.equal(calls[1].args.p_confirmar,true);
 assert.equal(calls[1].args.p_filas[0].observaciones,'Texto corregido');
 assert.equal(calls[1].args.p_filas[0].fecha_inicio,'2026-02-14');
 await p.close();
}finally{await browser.close()}
console.log('R370: botón disponible junto a Importar 0, lectura Excel, vista previa y confirmación de cambios');
});
