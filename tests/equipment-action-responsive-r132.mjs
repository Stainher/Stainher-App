import assert from 'node:assert/strict';
import fs from 'node:fs';

const view=fs.readFileSync('assets/stainher-v1524-equipment-view-r120.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(view,/EQUIPMENT_VIEW_VERSION__='R132'/,'R132 debe quedar activo');
assert.match(view,/minmax\(255px,1\.35fr\)/,'La columna Acciones debe reservar ancho suficiente');
assert.match(view,/min-width:255px!important/,'Acciones no debe comprimirse por debajo del ancho mínimo');
assert.match(view,/min-width:max-content!important/,'Los botones deben conservar el ancho de su texto');
assert.match(view,/flex:0 0 auto!important/,'Los botones no deben encogerse al cambiar zoom');
assert.match(view,/overflow:visible!important/,'El texto no debe quedar recortado');
assert.match(view,/text-overflow:clip!important/,'No debe aplicar truncado al texto de acciones');
assert.match(view,/summary::marker/,'Debe ocultar el marcador nativo del details');
assert.match(view,/summary::after/,'Debe dibujar un único indicador de despliegue');
assert.match(view,/summary\.textContent='Gestionar'/,'Gestionar no debe duplicar flechas');
assert.match(view,/@media\(max-width:1360px\)/,'Debe cambiar de layout antes de comprimir acciones');
assert.match(view,/@media\(max-width:760px\)/,'Debe conservar adaptación móvil');

assert.match(loader,/HP_LOADER_VERSION__='R139'/,'Loader consolidado R139 debe conservar Equipos R132');
assert.match(loader,/refreshEquipmentViewR132/,'Loader debe cargar R132');
assert.match(loader,/StainherEquipmentViewR132\?\.install/,'Loader debe instalar R132');
assert.match(loader,/stainher:equipment-view-r132-ready/,'Loader debe emitir evento R132');
assert.match(loader,/stainher-v1524-forecast-history-r128\.js/,'R128 debe conservarse');

new Function(view);
new Function(loader);
console.log('equipment-action-responsive-r132: ok');
