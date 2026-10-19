import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const ggrr=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');

assert.match(core,/<th>Fecha<\/th><th>Código<\/th><th>Equipo<\/th><th>Detalle<\/th>/,'Histórico debe usar vista Fecha, Código, Equipo y Detalle');
assert.match(core,/function historyDetail\(r\)/,'Debe construir resumen rápido');
assert.match(core,/r\?\.materiales/,'Resumen debe usar materiales');
assert.doesNotMatch(core,/r\?\.fletes/,'Resumen no debe usar fletes');
assert.doesNotMatch(core,/r\?\.observacion/,'Resumen no debe usar observaciones');
assert.match(core,/lines\.join\('\\n'\)/,'Debe mostrar ítems del detalle en líneas legibles');
assert.match(core,/unidad':'unidades'/,'Debe incluir cantidad/unidad en el detalle');
assert.match(core,/Total \(Iva Incluido\)/,'Debe indicar que el total incluye IVA');
assert.match(core,/r155-history-detail/,'Debe aplicar estilo al resumen');
assert.match(ggrr,/nth-child\(4\).*width:24%/s,'Detalle debe tener ancho prioritario');
assert.match(ggrr,/font-size:14px!important/,'Texto del histórico debe aumentar de tamaño');
assert.match(ggrr,/td\.colSpan=6/,'Filas de detalle deben cubrir las seis columnas');

new Function(core);
new Function(ggrr);

console.log('presupuestos-detail-column-r155: ok');
