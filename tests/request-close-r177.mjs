import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-request-close-r177.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261021204500_finalizar_solicitudes_r177.sql','utf8');

assert.match(moduleSrc,/Marcar como finalizada/,'Debe ofrecer cierre operacional');
assert.match(moduleSrc,/data-r178-tab="activas"/,'Debe incorporar pestaña Activas');
assert.match(moduleSrc,/data-r178-tab="finalizadas"/,'Debe incorporar pestaña Finalizadas');
assert.match(moduleSrc,/data-r178-final-count/,'Debe mostrar contador de solicitudes finalizadas');
assert.match(moduleSrc,/No hay solicitudes finalizadas/,'Debe mostrar estado vacío para finalizadas');
assert.match(moduleSrc,/finalizar_solicitud_operacional_r177/,'Debe usar RPC específica');
assert.match(moduleSrc,/finalizacion_observacion/,'Debe mostrar observación de cierre');
assert.match(moduleSrc,/Gestión finalizada/,'Debe destacar solicitudes finalizadas');
assert.match(moduleSrc,/new Set\(\['otro','permiso','cambio_turno'\]\)/,'Solo aplica a solicitudes operativas');
assert.match(moduleSrc,/row\.estado!=='aprobada'/,'Solo debe finalizar solicitudes aprobadas');

assert.match(migration,/finalizada_por/,'Debe guardar responsable de cierre');
assert.match(migration,/finalizacion_observacion/,'Debe guardar observación de cierre');
assert.match(migration,/'finalizada'::text/,'Estado check debe aceptar finalizada');
assert.match(migration,/Solo se pueden finalizar solicitudes aprobadas/,'RPC debe exigir aprobación previa');
assert.match(migration,/Solo el Administrador o el aprobador asignado/,'RPC debe controlar quién puede cerrar');
assert.match(migration,/Debes registrar una observación de cierre/,'RPC debe exigir observación');

assert.match(loader,/refreshRequestCloseR177/,'Loader debe cargar R177');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R177'/,'Loader debe forzar versión R177');

new Function(moduleSrc);
new Function(loader);
console.log('request-close-r177: ok');

assert.match(moduleSrc,/data-r179-type="vacaciones"/,'Debe separar vacaciones');
assert.match(moduleSrc,/data-r179-type="permisos"/,'Debe separar permisos');
assert.match(moduleSrc,/data-r179-type="otras"/,'Debe separar otras solicitudes');
assert.match(moduleSrc,/function requestCategory\(type\)/,'Debe clasificar solicitudes por tipo');
assert.match(moduleSrc,/window\.state\.r178SolicitudesTab='finalizadas'/,'Al finalizar debe mover inmediatamente a la pestaña Finalizadas');
assert.match(moduleSrc,/Object\.assign\(local,/,'Debe actualizar el estado local inmediatamente después del cierre');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R179'/,'Loader debe forzar versión R179');
