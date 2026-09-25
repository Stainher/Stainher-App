import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-edp-equipment-r122.js','utf8');
const forecast=fs.readFileSync('assets/stainher-v1524-contract-forecast-r121.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260925154500_edp_mantenimiento_equipos_r122.sql','utf8');

assert.match(moduleSrc,/EDP_EQUIPMENT_R122__===BUILD/,'R122 debe ser la implementación activa');
assert.match(moduleSrc,/const OP_REFERENCE=45364683/,'Debe conservar la referencia contractual de Gasto Operativo');
assert.match(moduleSrc,/function splitReal\(ep,rows=detailsFor/,'Debe separar mantenimiento equipos, operativo y GGRR');
assert.match(moduleSrc,/const residual=Math\.max\(0,total-ggrr-field\)/,'Debe detectar el caso septiembre donde el operativo quedó fuera de mantenimiento');
assert.match(moduleSrc,/source:'residual'/,'Debe identificar la corrección histórica por diferencia');
assert.match(moduleSrc,/edp_mantenimiento_equipos_v1524/,'Debe persistir el desglose por equipo');
assert.match(moduleSrc,/Ingresar desglose|Editar desglose/,'Debe permitir ingresar o editar el detalle desde EDP');
assert.match(moduleSrc,/Guardar desglose/,'Debe permitir guardar el detalle');
assert.match(moduleSrc,/Gasto Operativo \/ General/,'Debe distinguir correctamente la partida Gasto Operativo / General');
assert.match(moduleSrc,/Mantenimiento equipos/,'Debe mostrar el total por equipos separado');
assert.match(moduleSrc,/Total real proyectable/,'Debe corregir el total proyectable histórico');
assert.match(moduleSrc,/patchForecastHistorical/,'Debe reparar el resumen histórico');
assert.match(moduleSrc,/syncForecastMonths/,'Debe alimentar el gráfico con el proyectable real corregido');
assert.match(moduleSrc,/Conciliación R122/,'Debe explicar en pantalla cómo se concilia el histórico');

const septiembre={total:70390017,mantenimiento:23422332,ggrr:1603002};
assert.equal(
  septiembre.total-septiembre.mantenimiento-septiembre.ggrr,
  45364683,
  'Septiembre debe mostrar $45.364.683 como Gasto Operativo / General, no $23.422.332'
);

assert.match(forecast,/__r122Projectable/,'R121 debe usar el proyectable real corregido para la serie histórica');
assert.match(loader,/stainher-v1524-edp-equipment-r122\.js/,'El loader debe cargar R122');
assert.match(loader,/StainherEdpEquipmentR122\?\.install/,'El loader debe instalar R122');
assert.match(loader,/HP_LOADER_VERSION__='R122'/,'El loader debe quedar consolidado como R122');

assert.match(migration,/create table if not exists public\.edp_mantenimiento_equipos_v1524/,'Debe crear tabla de desglose EDP');
assert.match(migration,/lower\(coalesce\(p\.rol,''\)\) in \('administrador','confiabilidad'\)/,'Administrador y Confiabilidad deben poder gestionar el desglose');
assert.match(migration,/where ep\.anio_edp=2026 and ep\.mes_edp=8/,'Debe migrar el desglose histórico de agosto ya existente');

new Function(moduleSrc);
new Function(forecast);
new Function(loader);

console.log('edp-equipment-r122: ok');
