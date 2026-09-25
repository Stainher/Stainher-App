import assert from 'node:assert/strict';
import fs from 'node:fs';

const history=fs.readFileSync('assets/stainher-v1524-forecast-history-r124.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(history,/FORECAST_HISTORY_R124__===BUILD/,'R124 debe quedar activo');
assert.match(history,/Resumen Mensual Histórico/,'Debe reconstruir el resumen mensual histórico');
assert.match(history,/anchorAfterCharts/,'Debe ubicar el resumen después de los gráficos');
assert.match(history,/insertAdjacentElement\('afterend',panel\)/,'Debe insertar el panel en el DOM');
assert.match(history,/removeAttribute\('hidden'\)/,'Debe recuperar un panel oculto');
assert.match(history,/StainherEdpEquipmentR122/,'Debe reutilizar la conciliación R122');
assert.match(history,/data-r124-month/,'Debe mantener selector mensual');
assert.match(history,/Resumen histórico por equipo/,'Debe mostrar tabla por equipo');
assert.match(history,/Resumen histórico por partida/,'Debe mostrar tabla por partida');

assert.match(loader,/HP_LOADER_VERSION__='R124'/,'El loader debe quedar consolidado como R124');
assert.match(loader,/stainher-v1524-forecast-history-r124\.js/,'El loader debe cargar R124');
assert.match(loader,/StainherForecastHistoryR124\?\.install/,'El loader debe instalar R124');
assert.match(loader,/stainher-v1524-contract-forecast-r123\.js/,'R123 debe conservarse');
assert.match(loader,/stainher-v1524-edp-equipment-r122\.js/,'R122 debe conservarse');

new Function(history);
new Function(loader);

console.log('forecast-history-r124: ok');
