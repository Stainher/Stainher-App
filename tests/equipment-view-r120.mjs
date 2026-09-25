import assert from 'node:assert/strict';
import fs from 'node:fs';

const view=fs.readFileSync('assets/stainher-v1524-equipment-view-r120.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(view,/EQUIPMENT_VIEW_VERSION__='R120'/,'R120 debe ser la vista activa de Equipos');
assert.match(view,/data-stainher-equipment-view="list"/,'Debe existir la regla visual para Lista');
assert.match(view,/data-stainher-equipment-view="cards"/,'Debe existir la regla visual para Fichas');
assert.match(view,/if\(!root\.dataset\.stainherEquipmentView\)root\.dataset\.stainherEquipmentView='list'/,'Lista debe ser la vista inicial por defecto');
assert.match(view,/data-r120-equipment-view="list"/,'Debe existir el botón Lista');
assert.match(view,/data-r120-equipment-view="cards"/,'Debe existir el botón Fichas');
assert.match(view,/function proxyActions\(card\)/,'La vista Lista debe reutilizar las acciones existentes');
assert.match(view,/button\.click\(\)/,'Las acciones de Lista deben delegar en la ficha original para conservar CRUD y permisos');
assert.match(view,/window\.state\?\.equipos/,'La lista debe usar los datos de Equipos cargados');
assert.match(view,/Plan\s\+preventivo/,'La lista debe conservar el indicador del plan preventivo');
assert.match(view,/Fabricante s\/i/,'Debe manejar equipos sin fabricante');
assert.match(view,/grid-template-columns/,'La lista debe alinear sus columnas');
assert.match(view,/@media\(max-width:760px\)/,'Debe existir adaptación móvil');
assert.match(view,/if\(installed\)return;installed=true/,'El módulo no debe instalar observadores duplicados');

assert.match(loader,/HP_LOADER_VERSION__='R120'/,'El cargador debe quedar consolidado como R120');
assert.match(loader,/refreshEquipmentViewR120/,'El bootstrap debe cargar la nueva vista de Equipos');
assert.match(loader,/stainher-v1524-equipment-view-r120\.js/,'El cargador debe cargar el módulo R120');
assert.match(loader,/refreshReliabilityActionsR119/,'R119 debe conservarse');
assert.match(loader,/refreshCorrectivoHistoryR118/,'R118 debe conservarse');
assert.match(loader,/stainher-weekly-hp-runtime-r117/,'R117 HP debe conservarse');

new Function(view);
new Function(loader);

console.log('equipment-view-r120: ok');
