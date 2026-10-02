import assert from 'node:assert/strict';
import fs from 'node:fs';

const action=fs.readFileSync('assets/stainher-v1524-preventivo-delete-schedule-r140.js','utf8');
const state=fs.readFileSync('assets/stainher-v1524-preventivo-state-r137.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(action,/PREVENTIVO_DELETE_SCHEDULE_R140__===BUILD/,'R140 debe quedar activo');
assert.match(action,/Eliminar programación/,'Debe mostrar la acción solicitada');
assert.match(action,/!!row\?\.fecha_programada&&!row\?\.fecha_ejecucion/,'Solo actividades programadas no ejecutadas pueden eliminar programación');
assert.match(action,/stripLegacyDelete/,'Debe retirar la acción genérica Eliminar para evitar ambigüedad');
assert.match(action,/fecha_programada:null/,'Debe quitar solo la fecha programada');
assert.match(action,/estado:'pendiente'/,'Debe devolver la actividad a Por calendarizar');
assert.match(action,/eliminar_programacion_individual/,'Debe registrar auditoría específica');
assert.match(action,/fecha_programada_anterior/,'La auditoría debe conservar la fecha anterior');
assert.match(action,/Motivo/,'Debe exigir motivo para trazabilidad');
assert.match(action,/Una actividad ejecutada conserva su programación/,'Debe proteger actividades ejecutadas');
assert.doesNotMatch(action,/\.delete\(\)/,'No debe borrar el registro de programacion_preventiva');
assert.doesNotMatch(action,/preventivo_reprogramaciones.*insert/,'No debe falsear una reprogramación para registrar la eliminación');

assert.match(state,/eliminar\\s\+programaci\[oó\]n/,'R137 debe mantener abierto el equipo al eliminar programación');

assert.match(loader,/HP_LOADER_VERSION__='R141'/,'Loader debe quedar consolidado en R141');
assert.match(loader,/refreshPreventivoDeleteScheduleR140/,'Loader debe cargar R140');
assert.match(loader,/stainher-v1524-preventivo-delete-schedule-r140\.js/,'Loader debe cargar el módulo R140');
assert.match(loader,/StainherPreventivoDeleteScheduleR140\?\.install/,'Loader debe instalar R140');
assert.match(loader,/stainher:preventivo-delete-schedule-r140-ready/,'Loader debe emitir evento R140');
assert.match(loader,/stainher:runtime-r140-ready/,'Loader debe emitir runtime R140');
assert.match(loader,/refreshApprovedRerouteR138/,'R138 debe conservarse');
assert.match(loader,/refreshPreventivoStateR137/,'R137 debe conservarse');

new Function(action);
new Function(state);
new Function(loader);
console.log('preventivo-delete-schedule-r140: ok');
