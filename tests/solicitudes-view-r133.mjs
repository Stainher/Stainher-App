import assert from 'node:assert/strict';
import fs from 'node:fs';

const view=fs.readFileSync('assets/stainher-v1524-solicitudes-view-r133.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(view,/SOLICITUDES_VIEW_R133__===BUILD/,'R133 debe quedar activo');
assert.match(view,/Reducido para revisión rápida/,'Debe explicar la vista reducida');
assert.match(view,/Maximizado para ver todo el detalle/,'Debe ofrecer vista maximizada');
assert.match(view,/data-r133-solicitudes-view="compact"/,'Debe existir selector Reducido');
assert.match(view,/data-r133-solicitudes-view="expanded"/,'Debe existir selector Maximizado');
assert.match(view,/return saved==='expanded'\?'expanded':'compact'/,'Reducido debe ser la vista inicial');
assert.match(view,/localStorage\.setItem\(STORAGE_KEY,next\)/,'Debe recordar la vista elegida');
assert.match(view,/data-r133-field="detail"/,'Debe ocultar detalles en vista reducida');
assert.match(view,/v1524-just-detail/,'Debe contemplar justificativos');
assert.match(view,/v154-request-actions/,'Debe mantener las acciones existentes');
assert.match(view,/renderSolicitudesV15=wrapped/,'Debe reaplicar el modo tras recargar solicitudes');
assert.match(view,/@media\(max-width:680px\)/,'Debe conservar adaptación móvil');

assert.match(loader,/HP_LOADER_VERSION__='R142'/,'Loader debe quedar consolidado en R142');
assert.match(loader,/refreshSolicitudesViewR133/,'Loader debe cargar la vista de Solicitudes');
assert.match(loader,/stainher-v1524-solicitudes-view-r133\.js/,'Loader debe cargar el módulo R133');
assert.match(loader,/StainherSolicitudesViewR133\?\.install/,'Loader debe instalar R133');
assert.match(loader,/refreshEquipmentViewR132/,'R132 de Equipos debe conservarse');
assert.match(loader,/stainher-v1524-forecast-history-r128\.js/,'R128 Forecast debe conservarse');

new Function(view);
new Function(loader);
console.log('solicitudes-view-r133: ok');
