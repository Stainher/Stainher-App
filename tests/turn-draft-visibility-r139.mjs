import assert from 'node:assert/strict';
import fs from 'node:fs';

const visibility=fs.readFileSync('assets/stainher-v1524-turn-draft-visibility-r139.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(visibility,/TURN_DRAFT_VISIBILITY_R139__===BUILD/,'R139 debe quedar activo');
assert.match(visibility,/administrador','planificador','confiabilidad','prevencion/,'Debe permitir borradores solo a los perfiles operativos definidos');
assert.match(visibility,/DRAFT_VIEW_ROLES\.has\(r\)/,'La visibilidad debe resolverse por rol');
assert.match(visibility,/current\.__v1524visibility&&typeof current\.__base==='function'/,'Debe saltar el filtro histórico R136/R137 y usar el loader base');
assert.match(visibility,/allVisibleShifts/,'Debe conservar la malla completa antes del filtro');
assert.match(visibility,/if\(canSeeProgrammedDrafts\(\)\)/,'Debe incluir borradores para roles autorizados');
assert.match(visibility,/estado_publicacion==='publicado'/,'Los demás perfiles deben conservar la restricción a publicados');
assert.match(visibility,/eventHasPublishedDate/,'Supervisor/Técnico deben mantener novedades ligadas a turnos publicados');
assert.match(visibility,/r139DraftVisibility/,'Debe dejar diagnóstico del modo efectivo');
assert.match(visibility,/renderTurnosV15/,'Debe refrescar la vista activa al instalar la corrección');
assert.doesNotMatch(visibility,/\.from\(|\.rpc\(/,'R139 no debe duplicar consultas ni escribir en Supabase');

assert.match(loader,/HP_LOADER_VERSION__='R139'/,'Loader debe quedar consolidado en R139');
assert.match(loader,/refreshTurnDraftVisibilityR139/,'Loader debe cargar R139');
assert.match(loader,/stainher-v1524-turn-draft-visibility-r139\.js/,'Loader debe cargar el módulo R139');
assert.match(loader,/StainherTurnDraftVisibilityR139\?\.install/,'Loader debe instalar R139');
assert.match(loader,/stainher:turn-draft-visibility-r139-ready/,'Loader debe emitir evento R139');
assert.match(loader,/stainher:runtime-r139-ready/,'Loader debe emitir runtime R139');
assert.match(loader,/refreshApprovedRerouteR138/,'R138 debe conservarse');
assert.match(loader,/refreshPreventivoStateR137/,'R137 debe conservarse');
assert.match(loader,/refreshRequestApproverR135/,'R135 debe conservarse');

new Function(visibility);
new Function(loader);
console.log('turn-draft-visibility-r139: ok');
