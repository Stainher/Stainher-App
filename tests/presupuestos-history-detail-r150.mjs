import assert from 'node:assert/strict';
import fs from 'node:fs';

/* R157 sustituyó la antigua acción R150 "Detalle" por una columna visible.
 * Verificar esta decisión productiva sin volver a introducir botones obsoletos. */
const history=fs.readFileSync('assets/stainher-presupuestos-history-r150.js','utf8');
const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(history,/R157 · Histórico de Presupuestos sin acción Detalle/,'La revisión R157 es la vigente');
assert.match(history,/querySelectorAll\('#page-contrato \[data-r150-detail\]'\)/,'Quitar botones R150 heredados');
assert.match(history,/querySelectorAll\('#page-contrato \.r150-detail-row'\)/,'Quitar filas expandidas obsoletas');
assert.match(history,/node=>node\.remove\(\)/,'Los restos obsoletos deben eliminarse');
assert.match(history,/new MutationObserver\(schedule\)/,'Control tras rerender sin instalar múltiples observadores');
assert.match(history,/dataset\.r157NoDetailObserver/,'El observador debe ser idempotente');
assert.match(core,/<th>Detalle<\/th>/,'El histórico conserva columna Detalle visible');
assert.match(core,/<th style="text-align:right">Total neto<\/th>/,'Mostrar el total neto solicitado');
assert.match(core,/r160BudgetRows/,'La columna pertenece a la lista real de presupuestos');
assert.match(loader,/stainher-presupuestos-history-r150\.js/,'Mantener el módulo de compatibilidad');
assert.match(loader,/StainherPresupuestosHistoryR150\?\.install/,'Instalar limpieza en runtime');
assert.match(loader,/stainher:presupuestos-r150-ready/,'Conservar evento de compatibilidad');
new Function(history);new Function(core);new Function(loader);
console.log('presupuestos-history-detail-r150: R157 contract verified');
