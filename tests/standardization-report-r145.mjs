import assert from 'node:assert/strict';
import fs from 'node:fs';

const report=fs.readFileSync('assets/stainher-v1524-standardization-report-r145.js','utf8');
const bridge=fs.readFileSync('assets/stainher-v1524-standardization-access-r142.js','utf8');

assert.match(report,/STAINHER_STANDARDIZATION_REPORT_R145/,'Debe declarar R145');
assert.match(report,/installCorporatePdfV95/,'Debe usar el pie/encabezado corporativo transversal');
assert.match(report,/function donutImage/,'Debe generar el gráfico total tipo dona');
assert.match(report,/doc\.addImage\(donutImage\(s\),'PNG'/,'Debe insertar la dona en el PDF');
assert.match(report,/drawStackedBar/,'Debe mantener barras de avance por equipo');
assert.match(report,/data-std-report-r144/,'Debe reemplazar la acción del botón de informe existente');
assert.doesNotMatch(report,/Stainher App · Estandarización · Página/,'No debe dibujar un pie manual duplicado');
assert.doesNotMatch(report,/doc\.text\(`Emitido \$\{todayIso\(\)\}`/,'No debe dibujar fecha manual en el pie');
assert.match(report,/bottom:22/,'La tabla debe reservar espacio para el pie corporativo');

assert.match(bridge,/loadReportR145/,'El bridge debe cargar R145');
assert.match(bridge,/stainher-v1524-standardization-report-r145\.js/,'El bridge debe cargar el archivo R145');
assert.match(bridge,/standardization-report-r145-ready/,'Debe emitir evento R145');
assert.match(bridge,/loadDashboardR144\(\)\.then/,'R145 debe cargarse después del dashboard R144');

new Function(report);
new Function(bridge);
console.log('standardization-report-r145: ok');
