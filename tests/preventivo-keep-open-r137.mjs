import assert from 'node:assert/strict';
import fs from 'node:fs';

const state=fs.readFileSync('assets/stainher-v1524-preventivo-state-r137.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(state,/PREVENTIVO_STATE_R137__===BUILD/,'R137 debe quedar activo');
assert.match(state,/v1523-prev-equipment-group/,'Debe actuar sobre el grupo real de equipos de Preventivo');
assert.match(state,/details\.\$\{GROUP\}/,'Debe reconocer el grupo después de convertirse en <details>');
assert.match(state,/section\.\$\{GROUP\}/,'Debe reconocer el grupo antes de convertirse en <details>');
assert.match(state,/rememberedOpen=new Set/,'Debe conservar los equipos abiertos por nombre');
assert.match(state,/stainherPreventivoKeepOpen/,'Debe marcar el grupo antes de la conversión asíncrona');
assert.match(state,/MutationObserver/,'Debe detectar la conversión posterior realizada por el módulo global de desplegables');
assert.match(state,/details\.open=true/,'Debe reabrir el equipo después de la conversión');
assert.match(state,/wrapContentRenderer\('v1523RenderPreventiveContent'\)/,'Debe engancharse al render real V15.23 del listado agrupado');
assert.match(state,/calendarizar\|reprogramar\|confirmar\\s\+ejecuci/,'Debe cubrir Calendarizar, Reprogramar y Confirmar ejecución');
assert.match(state,/scrollLeft=state\.horizontal/,'Debe conservar la posición horizontal de la tabla');
assert.match(state,/window\.scrollTo/,'Debe conservar la posición vertical');
assert.match(state,/window\.scrollBy/,'Debe compensar cambios de altura tras el refresco');
assert.doesNotMatch(state,/\.from\(|\.rpc\(/,'R137 no debe modificar ni consultar datos');

assert.match(loader,/HP_LOADER_VERSION__='R140'/,'Loader debe quedar consolidado en R140');
assert.match(loader,/refreshPreventivoStateR137/,'Loader debe cargar R137');
assert.match(loader,/stainher-v1524-preventivo-state-r137\.js/,'Loader debe cargar el módulo R137');
assert.match(loader,/StainherPreventivoStateR137\?\.install/,'Loader debe instalar R137');
assert.match(loader,/stainher:preventivo-state-r137-ready/,'Loader debe emitir evento de módulo R137');
assert.match(loader,/stainher:runtime-r137-ready/,'Loader debe emitir runtime R137');
assert.doesNotMatch(loader,/await refreshPreventivoStateR136\(\)/,'R136 no debe ejecutarse junto a R137');
assert.match(loader,/refreshRequestApproverR135/,'R135 debe conservarse');
assert.match(loader,/refreshSolicitudesViewR133/,'R133 debe conservarse');
assert.match(loader,/refreshEquipmentViewR132/,'R132 debe conservarse');

new Function(state);
new Function(loader);
console.log('preventivo-keep-open-r137: ok');
