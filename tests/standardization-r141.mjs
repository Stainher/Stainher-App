import assert from 'node:assert/strict';
import fs from 'node:fs';

const module=fs.readFileSync('assets/stainher-v1524-standardization-r141.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261002103000_standardization_r141.sql','utf8');

assert.match(module,/STAINHER_STANDARDIZATION_R141__===BUILD/,'R141 debe quedar activo');
assert.match(module,/◇ Estandarización/,'Debe agregar Estandarización al menú');
assert.match(module,/page-estandarizacion/,'Debe crear una página independiente');
assert.match(module,/Total actividades/,'Debe mostrar KPI total');
assert.match(module,/Realizadas/,'Debe mostrar KPI realizados');
assert.match(module,/En proceso/,'Debe mostrar KPI en proceso');
assert.match(module,/No realizadas/,'Debe mostrar KPI no realizados');
assert.match(module,/Avance global/,'Debe calcular avance global');
assert.match(module,/stdEquipmentFilter/,'Debe filtrar por equipo');
assert.match(module,/stdStatusFilter/,'Debe filtrar por estado');
assert.match(module,/stdSearchFilter/,'Debe permitir búsqueda libre');
assert.match(module,/Nueva actividad/,'Debe permitir crear nuevas actividades');
assert.match(module,/Editar actividad/,'Debe permitir editar actividades');
assert.match(module,/Exportar CSV/,'Debe permitir exportar el control');
assert.match(module,/fecha_ejecucion/,'Debe gestionar fecha de ejecución');
assert.match(module,/responsable/,'Debe gestionar responsable');
assert.match(module,/detalle_ejecucion/,'Debe gestionar detalle de avance/ejecución');
assert.match(module,/gerente','planificador','confiabilidad','prevencion','supervisor/,'Debe definir acceso explícito por rol');

assert.match(migration,/create table if not exists public\.estandarizacion_actividades_v141/,'Debe crear tabla R141');
assert.match(migration,/check \(estado in \('REALIZADO','EN PROCESO','NO REALIZADO'\)\)/,'Debe validar los tres estados');
assert.match(migration,/enable row level security/,'Debe habilitar RLS');
assert.match(migration,/estandarizacion_v141_select/,'Debe crear política de lectura');
assert.match(migration,/estandarizacion_v141_update/,'Debe crear política de edición');
assert.match(migration,/source_key text unique/,'La precarga debe ser idempotente');
assert.equal((migration.match(/excel-normalizacion-2026-10-02-/g)||[]).length,55,'Debe precargar exactamente 55 actividades');
assert.equal((migration.match(/"estado":"REALIZADO"/g)||[]).length,26,'Debe conservar 26 realizadas');
assert.equal((migration.match(/"estado":"EN PROCESO"/g)||[]).length,13,'Debe conservar 13 en proceso');
assert.equal((migration.match(/"estado":"NO REALIZADO"/g)||[]).length,16,'Debe conservar 16 no realizadas');
assert.match(migration,/"equipo":"NODO 3700"/,'Debe unificar NODO3700 como NODO 3700');

assert.match(loader,/HP_LOADER_VERSION__='R141'/,'Loader debe quedar consolidado en R141');
assert.match(loader,/refreshStandardizationR141/,'Loader debe cargar R141');
assert.match(loader,/stainher-v1524-standardization-r141\.js/,'Loader debe cargar el módulo R141');
assert.match(loader,/StainherStandardizationR141\?\.install/,'Loader debe instalar R141');
assert.match(loader,/stainher:standardization-r141-ready/,'Loader debe emitir evento R141');
assert.match(loader,/stainher:runtime-r141-ready/,'Loader debe emitir runtime R141');
assert.match(loader,/refreshPreventivoDeleteScheduleR140/,'R140 debe conservarse');
assert.match(loader,/refreshApprovedRerouteR138/,'R138 debe conservarse');

new Function(module);
new Function(loader);
console.log('standardization-r141: ok');
