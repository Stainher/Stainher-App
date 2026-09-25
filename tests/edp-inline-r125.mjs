import assert from 'node:assert/strict';
import fs from 'node:fs';

const inline=fs.readFileSync('assets/stainher-v1524-edp-inline-r125.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(inline,/EDP_INLINE_R125__===BUILD/,'R125 debe quedar activo');
assert.match(inline,/Editar Estado de Pago/,'Debe detectar el modal existente de edición EDP');
assert.match(inline,/Desglose mantenimiento por equipo/,'Debe insertar el desglose dentro del modal');
assert.match(inline,/Nodo 3700/,'Debe incluir Nodo 3700');
assert.match(inline,/HUINCHE ASEA/,'Debe incluir ASEA');
assert.match(inline,/HUINCHE OTIS/,'Debe incluir OTIS');
assert.match(inline,/HUINCHE ALIMAK/,'Debe incluir ALIMAK');
assert.match(inline,/Huinche Tercer Panel/,'Debe incluir PTP');
assert.match(inline,/Ascensor EILA 1 y 2/,'Debe incluir EILA');
assert.match(inline,/Montacargas Hilton/,'Debe incluir Hilton');
assert.match(inline,/edp_mantenimiento_equipos_v1524/,'Debe guardar en la tabla R122');
assert.match(inline,/Guardar desglose equipos/,'Debe tener acción de guardado visible');
assert.match(inline,/Mantenimiento EDP/,'Debe mostrar conciliación con Mantenimiento');
assert.match(inline,/Gasto Operativo \/ General/,'Debe mostrar Gasto Operativo / General');
assert.match(inline,/Gastos Reembolsables/,'Debe leer GGRR desde el modal');
assert.match(inline,/MutationObserver/,'Debe reaccionar al modal aunque se abra después de cargar el módulo');

assert.match(loader,/HP_LOADER_VERSION__='R125'/,'El loader debe quedar consolidado como R125');
assert.match(loader,/stainher-v1524-edp-inline-r125\.js/,'El loader debe cargar R125');
assert.match(loader,/StainherEdpInlineR125\?\.install/,'El loader debe instalar R125');
assert.match(loader,/stainher-v1524-forecast-history-r124\.js/,'R124 debe conservarse');
assert.match(loader,/stainher-v1524-contract-forecast-r123\.js/,'R123 debe conservarse');
assert.match(loader,/stainher-v1524-edp-equipment-r122\.js/,'R122 debe conservarse');

new Function(inline);
new Function(loader);

console.log('edp-inline-r125: ok');
