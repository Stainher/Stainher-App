import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('assets/stainher-presupuestos-r80.js','utf8');

assert.match(core,/id="r160BudgetSearch"/,'Debe incluir buscador');
assert.match(core,/id="r160BudgetEquipment"/,'Debe incluir filtro por equipo');
assert.match(core,/id="r160BudgetDestination"/,'Debe incluir filtro por destino');
assert.match(core,/id="r160BudgetEp"/,'Debe incluir filtro por Estado de Pago');
assert.match(core,/function filteredBudgetRows\(\)/,'Debe aplicar filtros al histórico');
assert.match(core,/haystack\.includes\(q\)/,'Buscador debe buscar en código equipo detalle y observación');
assert.match(core,/function aggregateEquipment\(rows\)/,'Debe agrupar presupuestos por equipo');
assert.match(core,/Cantidad de presupuestos por equipo/,'Debe mostrar gráfico de cantidad por equipo');
assert.match(core,/function countColumnChart\(groups\)/,'Cantidad por equipo debe usar gráfico de columnas');
assert.match(core,/class="r169-column-bar"/,'Debe renderizar columnas verticales');
assert.match(core,/height:\$\{pct\}%/,'Altura de columna debe ser proporcional a la cantidad');
assert.match(core,/Valor por equipo · IVA incluido/,'Debe mostrar gráfico de valor por equipo');
assert.match(core,/Los gráficos consideran los filtros aplicados/,'Gráficos deben respetar filtros');
assert.match(core,/class="r160-chart-bar"/,'Debe representar barras de detalle por equipo');
assert.match(core,/Mostrando \$\{rows\.length\} de \$\{all\.length\} presupuestos/,'Debe mostrar cantidad filtrada');
assert.match(core,/Total GGRR · IVA incluido/,'Debe mostrar total separado de GGRR');
assert.match(core,/Total Estandarización e Innovación · IVA incluido/,'Debe mostrar total separado de Estandarización e Innovación');
assert.match(core,/Total general · IVA incluido/,'Debe conservar el total general');
assert.match(core,/x\.tipo_imputacion==='gasto_reembolsable'/,'Total GGRR debe usar destino asignado');
assert.match(core,/x\.tipo_imputacion==='estandarizacion'/,'Total Estandarización debe usar destino asignado');
assert.match(core,/repeat\(6,minmax\(145px,1fr\)\)/,'KPIs deben distribuirse en seis tarjetas');

new Function(core);
console.log('presupuestos-analytics-r160: ok');
