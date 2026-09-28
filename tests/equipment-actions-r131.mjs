import assert from 'node:assert/strict';
import fs from 'node:fs';

const view=fs.readFileSync('assets/stainher-v1524-equipment-view-r120.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(view,/EQUIPMENT_VIEW_VERSION__='R132'/,'R132 debe quedar activo');
assert.match(view,/ACTION_BAR='stainher-equipment-actionbar-r131'/,'Debe existir una barra unificada de acciones');
assert.match(view,/actionKind/,'Debe clasificar acciones existentes sin cambiar su lógica');
assert.match(view,/eliminar\|dar de baja\|retirar/,'Debe agrupar acciones destructivas similares');
assert.match(view,/Gestionar/,'Las acciones destructivas deben ir bajo un único control Gestionar');
assert.match(view,/Retirar · conservar historial/,'Debe aclarar la acción Retirar');
assert.match(view,/stainher-equipment-detail-r131/,'Detalle debe tener jerarquía visual propia');
assert.match(view,/stainher-equipment-edit-r131/,'Editar debe tener jerarquía visual propia');
assert.match(view,/flex-wrap:nowrap/,'La vista escritorio debe evitar botones apilados');
assert.match(view,/organizeCardActions/,'La vista Fichas también debe usar la agrupación');
assert.match(view,/sourceActionButtons/,'Debe preservar botones originales como fuente de sus handlers');
assert.match(view,/button\.click\(\)/,'Los proxies deben ejecutar las acciones originales');
assert.match(view,/stainher-equipment-manage-menu-r131/,'Debe existir menú compacto para acciones sensibles');
assert.match(view,/@media\(max-width:760px\)/,'Debe conservar respuesta móvil');

assert.match(loader,/HP_LOADER_VERSION__='R135'/,'Loader consolidado R135 debe conservar Equipos R132');
assert.match(loader,/refreshEquipmentViewR132/,'Loader debe cargar la revisión R132');
assert.match(loader,/StainherEquipmentViewR132\?\.install/,'Loader debe instalar R132');
assert.match(loader,/stainher:equipment-view-r131-ready/,'Loader debe emitir evento R132');
assert.match(loader,/stainher-v1524-forecast-history-r128\.js/,'R128 Forecast debe conservarse');
assert.match(loader,/stainher-turn-report-hotfix-runtime-r126/,'R126 Turnos debe conservarse');

new Function(view);
new Function(loader);
console.log('equipment-actions-r131: ok');
