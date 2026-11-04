import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const src=fs.readFileSync('assets/stainher-v1524-correctivo-replace-r364.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const sql=fs.readFileSync('supabase/migrations/20261104145000_r364_reemplazo_excel_correctivo.sql','utf8');
new Function(src);new Function(loader);
assert.match(loader,/refreshCorrectivoReplaceR364/);
assert.match(loader,/stainher-v1524-correctivo-replace-r364\.js/);
assert.match(sql,/pg_advisory_xact_lock/);
assert.match(sql,/insert into public\.respaldos_averias_r364/);
assert.match(sql,/delete from public\.averias/);
assert.match(sql,/p_cantidad_esperada is distinct from v_actual/);
assert.match(sql,/v_rol not in \('administrador','confiabilidad'\)/);
assert.match(sql,/security invoker|LANGUAGE plpgsql/);
assert.match(src,/REEMPLAZAR/);
assert.match(src,/reemplazar_averias_excel_r364/);
assert.doesNotMatch(src,/\.from\('averias'\)\.delete/);
const browser=await chromium.launch({headless:true});
try{
 for(const userRole of ['confiabilidad','tecnico']){
  const page=await browser.newPage();
  await page.setContent('<html><body><section id="page-correctivo"><div id="corrBody"></div></section></body></html>');
  await page.evaluate(role=>{
   window.state={profile:{rol:role}};
   window.XLSX={read:()=>({SheetNames:['Correctivo'],Sheets:{Correctivo:{}}}),utils:{sheet_to_json:()=>[
    ['Equipo','Fecha Inicio','Hora Inicio','Fecha Término','Hora Término','Observaciones','N° guía'],
    ['NODO 3700','03-11-2026','08:30','03-11-2026','09:45','Falla de puertas','G-108']
   ]}};
  },userRole);
  await page.addScriptTag({content:src});
  assert.equal(await page.locator('#r364-start').count(),userRole==='confiabilidad'?1:0);
  if(userRole==='confiabilidad'){
   const parsed=await page.evaluate(()=>window.StainherCorrectivoReplaceR364.parse(new Uint8Array([1])));
   assert.equal(parsed.length,1);
   assert.equal(parsed[0].equipo_original,'NODO 3700');
   assert.equal(parsed[0].fecha_inicio,'2026-11-03');
   assert.equal(parsed[0].hora_inicio,'08:30');
   assert.equal(parsed[0].duracion_minutos,75);
  }
  await page.close();
 }
}finally{await browser.close()}
console.log('R364: permisos por rol, parseo de Excel y reemplazo SQL atómico con respaldo');
