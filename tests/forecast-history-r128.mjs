import assert from 'node:assert/strict';
import fs from 'node:fs';

const history=fs.readFileSync('assets/stainher-v1524-forecast-history-r128.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(history,/FORECAST_HISTORY_R128__===BUILD/,'R128 debe quedar activo');
assert.match(history,/edp_mantenimiento_equipos_v1524/,'Debe consultar la tabla real de detalle EDP');
assert.match(history,/ensureDetails/,'Debe hidratar detalle faltante');
assert.match(history,/\.eq\('estado_pago_id',ep\.id\)/,'Debe consultar el EDP seleccionado directamente');
assert.match(history,/mergeIntoState/,'Debe sincronizar detalle directo al estado local');
assert.match(history,/splitReal\(ep,rows\)/,'Debe calcular con las filas hidratadas');
assert.match(history,/Cargando desglose real de equipos/,'No debe mostrar falsamente Sin desglose durante la carga');
assert.match(history,/table-layout:fixed/,'Debe mantener tablas dentro de la cuadrícula');
assert.match(history,/overflow-wrap:anywhere/,'Debe evitar glosas fuera de la cuadrícula');
assert.match(history,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/,'Las dos tablas deben respetar el ancho disponible');
assert.doesNotMatch(history,/new MutationObserver/,'No debe reintroducir el observer problemático');
assert.match(history,/data-r128-month/,'Debe conservar selector mensual estable');

assert.match(loader,/HP_LOADER_VERSION__='R128'/,'Loader debe quedar en R128');
assert.match(loader,/stainher-v1524-forecast-history-r128\.js/,'Loader debe cargar R128');
assert.doesNotMatch(loader,/stainher-v1524-forecast-history-r127\.js/,'Loader no debe cargar simultáneamente R127');
assert.match(loader,/stainher-turn-report-hotfix-runtime-r126/,'R126 de suspendidos debe conservarse');
assert.match(loader,/stainher-v1524-edp-inline-r125\.js/,'R125 debe conservarse');

new Function(history);
new Function(loader);
console.log('forecast-history-r128: ok');
