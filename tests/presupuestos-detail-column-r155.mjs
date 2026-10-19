import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const ggrr=fs.readFileSync('assets/stainher-presupuestos-ggrr-r152.js','utf8');

assert.match(core,/<th>Código<\/th><th>Fecha<\/th><th>Detalle<\/th>/,'Histórico debe mostrar Código, Fecha y Detalle');
assert.doesNotMatch(core,/<th>Equipo<\/th>/,'Histórico no debe mostrar columna Equipo');
assert.match(core,/function historyDetail\(r\)/,'Debe construir resumen rápido');
assert.match(core,/r\?\.materiales/,'Resumen debe usar materiales');
assert.doesNotMatch(core,/r\?\.fletes/,'Resumen no debe usar fletes');
assert.doesNotMatch(core,/r\?\.observacion/,'Resumen no debe usar observaciones');
assert.match(core,/names\.join\(' · '\)/,'Debe mostrar solo nombres de piezas');
assert.match(core,/r155-history-detail/,'Debe aplicar estilo al resumen');
assert.match(ggrr,/nth-child\(3\).*width:30%/s,'Detalle debe tener ancho prioritario');

new Function(core);
new Function(ggrr);

console.log('presupuestos-detail-column-r155: ok');
