import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync('supabase/migrations/20261021201500_tipos_permisos_legales_r174.sql','utf8');

for(const type of [
  'vacaciones','permiso','cambio_turno','otro','justificativo',
  'permiso_matrimonio','permiso_fallecimiento','permiso_nacimiento'
]){
  assert.match(migration,new RegExp("'" + type + "'::text"),'Debe aceptar '+type);
}
assert.match(migration,/drop constraint if exists solicitudes_v15_tipo_check/,'Debe reemplazar check antiguo');
assert.match(migration,/add constraint solicitudes_v15_tipo_check/,'Debe recrear check');
console.log('tipos-permisos-legales-r174: ok');
