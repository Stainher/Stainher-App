import assert from 'node:assert/strict';
import fs from 'node:fs';

const forecast=fs.readFileSync('assets/stainher-v1524-contract-forecast-r121.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(forecast,/CONTRACT_FORECAST_R121__===BUILD/,'R121 debe ser la reparación final de Forecast');
assert.match(forecast,/removeDuplicateRefresh/,'Debe existir limpieza del botón Actualizar redundante');
assert.match(forecast,/label==='actualizar'.*action\.includes\('loadforecast'\)/s,'Solo debe eliminar el botón interno de Forecast');
assert.match(forecast,/dataset\.noCollapse='1'/,'Los paneles de gráficos deben quedar protegidos del colapsado posterior al render');
assert.match(forecast,/stainherForecastBarsR105/,'Debe neutralizar el plugin R105 cuando corresponda');
assert.match(forecast,/rebuildCharts/,'Debe reconstruir ambos gráficos con los datos vigentes');
assert.match(forecast,/state\.charts\.forecast=new C/,'Debe reconstruir Forecast mensual');
assert.match(forecast,/state\.charts\.forecastReal=new C/,'Debe reconstruir Forecast vs EDP real');
assert.match(forecast,/forecastDataV8/,'Los gráficos deben reutilizar el cálculo actual de Forecast');
assert.match(forecast,/historicalSeries/,'La serie real debe respetar el histórico disponible');
assert.match(forecast,/chart\.resize\(\);chart\.update\('none'\)/,'Debe forzar redimensionado visible');
assert.match(forecast,/wrapped=async function\(\)/,'La carga Forecast debe quedar envuelta con reparación final');
assert.match(forecast,/try\{out=await current\.apply/,'La reparación debe sobrevivir a una excepción de la capa histórica');
assert.match(forecast,/try\{out=current\.apply/,'El render debe sobrevivir a una excepción de la capa histórica');

assert.match(loader,/stainher-v1524-contract-forecast-r121\.js/,'El loader debe cargar R121 después de las capas históricas');
assert.match(loader,/StainherContractForecastR121\?\.install/,'El loader debe instalar R121');
assert.match(loader,/contract-forecast-r121-ready/,'Debe emitir evento de Forecast R121');
assert.match(loader,/HP_LOADER_VERSION__='R122'/,'El loader debe quedar consolidado como R121');
assert.match(loader,/refreshEquipmentViewR120/,'La mejora R120 de Equipos debe conservarse');
assert.match(loader,/refreshReliabilityActionsR119/,'R119 debe conservarse');
assert.match(loader,/refreshCorrectivoHistoryR118/,'R118 debe conservarse');
assert.match(loader,/stainher-weekly-hp-runtime-r117/,'R117 debe conservarse');

new Function(forecast);
new Function(loader);

console.log('contract-forecast-r121: ok');
