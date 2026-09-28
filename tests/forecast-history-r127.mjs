import assert from 'node:assert/strict';
import fs from 'node:fs';

const history=fs.readFileSync('assets/stainher-v1524-forecast-history-r127.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(history,/FORECAST_HISTORY_R127__===BUILD/,'R127 debe quedar activo');
assert.match(history,/No tocar el DOM si nada cambió/,'Debe evitar rerender cuando no cambia el estado');
assert.match(history,/sig===lastSignature/,'Debe usar firma de estado para no recrear el selector');
assert.doesNotMatch(history,/MutationObserver/,'R127 no debe usar el observador global que cerraba el selector');
assert.match(history,/data-r127-month/,'Debe conservar selector mensual');
assert.match(history,/addEventListener\('change'/,'El cambio de mes debe ser explícito');
assert.match(history,/window\.state\.forecastMonth=next/,'El mes seleccionado debe persistir en el estado');
assert.match(history,/render\(true\)/,'Debe actualizar inmediatamente al seleccionar otro mes');
assert.match(history,/StainherEdpEquipmentR122/,'Debe reutilizar la conciliación R122');
assert.match(history,/Resumen histórico por equipo/,'Debe mantener tabla por equipo');
assert.match(history,/Resumen histórico por partida/,'Debe mantener tabla por partida');
assert.match(history,/requestAnimationFrame/,'Debe renderizar sin bloqueos visibles');

assert.match(loader,/HP_LOADER_VERSION__='R127'/,'Loader debe quedar consolidado como R127');
assert.match(loader,/stainher-v1524-forecast-history-r127\.js/,'Loader debe cargar R127');
assert.doesNotMatch(loader,/stainher-v1524-forecast-history-r124\.js/,'Loader no debe reactivar el observer problemático de R124');
assert.match(loader,/stainher-turn-report-hotfix-runtime-r126/,'R126 de suspendidos debe conservarse');
assert.match(loader,/stainher-v1524-edp-inline-r125\.js/,'R125 debe conservarse');

new Function(history);
new Function(loader);
console.log('forecast-history-r127: ok');
