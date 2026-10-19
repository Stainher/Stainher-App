import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const ggrr=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');
const history=fs.readFileSync('assets/stainher-presupuestos-history-r150.js','utf8');

assert.match(core,/<th>Fecha<\/th><th>Código<\/th><th>Equipo<\/th><th>Detalle<\/th>/,'Histórico debe usar vista Fecha, Código, Equipo y Detalle');
assert.match(core,/function historyDetail\(r\)/,'Debe construir resumen rápido');
assert.match(core,/r\?\.materiales/,'Resumen debe usar materiales');
assert.doesNotMatch(core,/r\?\.fletes/,'Resumen no debe usar fletes');
assert.match(core,/r\?\.observacion/,'Históricos sin materiales deben usar la descripción guardada en observación');
assert.match(core,/lines\.join\('\\n'\)/,'Debe mostrar ítems del detalle en líneas legibles');
assert.match(core,/return historical\|\|'—'/,'Debe mostrar el detalle histórico cuando materiales esté vacío');
assert.match(core,/unidad':'unidades'/,'Debe incluir cantidad/unidad en el detalle');
assert.match(core,/>Total neto<\/th>/,'Histórico debe mostrar encabezado Total neto');
assert.match(core,/money\(r\.venta_neta\)/,'Cada fila del histórico debe mostrar venta neta');
assert.doesNotMatch(core,/>Total \(Iva Incluido\)<\/th>/,'Histórico ya no debe mostrar Total IVA incluido');
assert.match(core,/r155-history-detail/,'Debe aplicar estilo al resumen');
assert.match(core,/class="panel r80-form" data-no-collapse="1"/,'El editor debe quedar excluido del colapsado transversal');
assert.doesNotMatch(history,/btn\.textContent='Detalle'/,'No debe volver a crear botón Detalle');
assert.match(history,/\[data-r150-detail\].*remove\(\)/s,'Debe limpiar botones Detalle heredados');
assert.match(ggrr,/nth-child\(4\).*width:24%/s,'Detalle debe tener ancho prioritario');
assert.match(ggrr,/font-size:14px!important/,'Texto del histórico debe aumentar de tamaño');
assert.match(ggrr,/td\.colSpan=6/,'Filas de detalle deben cubrir las seis columnas');

new Function(core);
new Function(ggrr);
new Function(history);

console.log('presupuestos-detail-column-r155: ok');
