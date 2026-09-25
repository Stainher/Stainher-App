import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync('assets/stainher-v1524-contract-forecast-r123.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(runtime,/CONTRACT_FORECAST_R123__===BUILD/,'R123 debe quedar activo');
assert.match(runtime,/removeDuplicateRefresh/,'Debe eliminar el Actualizar redundante');
assert.match(runtime,/label==='actualizar'/,'Debe identificar el botón interno por texto');
assert.match(runtime,/r123-chart-overlay/,'Debe renderizar una capa gráfica visible');
assert.match(runtime,/monthlySvg/,'Debe dibujar Forecast mensual');
assert.match(runtime,/compareSvg/,'Debe dibujar Forecast vs EDP real');
assert.match(runtime,/__r122Projectable/,'Debe conservar el proyectable real corregido de R122');
assert.match(runtime,/Calculando Forecast/,'Debe vigilar cargas que queden detenidas');
assert.match(runtime,/showWatchdogMessage/,'Debe resolver estados prolongados de carga');
assert.match(runtime,/MutationObserver/,'Debe reaccionar a rerenderizados del Forecast');
assert.match(runtime,/renderContractForecastV8/,'Debe intervenir desde la entrada del módulo Forecast');
assert.match(runtime,/renderForecastBodyV9/,'Debe reparar después de renderizar');
assert.match(runtime,/loadForecastV9/,'Debe reparar después de cargar datos');

assert.match(loader,/HP_LOADER_VERSION__='R123'/,'El loader debe quedar consolidado como R123');
assert.match(loader,/stainher-v1524-contract-forecast-r123\.js/,'El loader debe cargar R123');
assert.match(loader,/StainherContractForecastR123\?\.install/,'El loader debe instalar R123');
assert.match(loader,/stainher-v1524-edp-equipment-r122\.js/,'R122 debe mantenerse');
assert.match(loader,/stainher-v1524-equipment-view-r120\.js/,'R120 debe mantenerse');

new Function(runtime);
new Function(loader);

console.log('forecast-runtime-r123: ok');
