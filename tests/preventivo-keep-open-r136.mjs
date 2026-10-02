import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=fs.readFileSync('assets/stainher-v1524-preventivo-state-r136.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(state,/PREVENTIVO_STATE_R136__===BUILD/,'R136 debe quedar activo');
assert.match(state,/calendarizar\|reprogramar\|confirmar\\s\+ejecuci/,'Debe reconocer Calendarizar, Reprogramar y Confirmar ejecución');
assert.match(state,/querySelectorAll\('details'\)/,'Debe trabajar sobre los grupos desplegables del listado preventivo');
assert.match(state,/detail\.open\?detailKey/,'Debe capturar los grupos que ya estaban abiertos');
assert.match(state,/detail\.open=true/,'Debe reabrir el grupo después del render');
assert.match(state,/wanted\.add\(state\.activeKey\)/,'El equipo activo debe mantenerse abierto aunque se reconstruya la vista');
assert.match(state,/scrollLeft=state\.horizontal/,'Debe conservar el desplazamiento horizontal de la tabla activa');
assert.match(state,/window\.scrollTo/,'Debe recuperar la posición vertical previa');
assert.match(state,/window\.scrollBy/,'Debe compensar cambios de altura para mantener el mismo punto visual');
assert.match(state,/window\.renderPreventivo=wrapped/,'Debe envolver el render preventivo sin cambiar su lógica de datos');
assert.match(state,/current\.apply\(this,arguments\)/,'Debe conservar la implementación preventiva existente');
assert.doesNotMatch(state,/\.from\(|\.rpc\(/,'R136 no debe escribir ni consultar datos por su cuenta');

assert.match(loader,/HP_LOADER_VERSION__='R141'/,'Loader consolidado debe haber superado R140');
assert.match(loader,/refreshPreventivoStateR137/,'R137 debe reemplazar la carga activa de R136');
assert.doesNotMatch(loader,/await refreshPreventivoStateR136\(\)/,'R136 no debe seguir ejecutándose junto a R137');
assert.match(loader,/stainher:runtime-r136-ready/,'El evento histórico R136 se conserva por compatibilidad');
assert.match(loader,/stainher:runtime-r137-ready/,'El runtime vigente debe ser R137');
assert.match(loader,/refreshRequestApproverR135/,'R135 de solicitudes debe conservarse');
assert.match(loader,/refreshSolicitudesViewR133/,'R133 debe conservarse');
assert.match(loader,/refreshEquipmentViewR132/,'R132 debe conservarse');
assert.match(loader,/stainher-v1524-forecast-history-r128\.js/,'R128 Forecast debe conservarse');

new Function(state);
new Function(loader);
console.log('preventivo-keep-open-r136: ok');
