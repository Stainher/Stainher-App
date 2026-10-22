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

assert.match(moduleSrc,/r180-filter-hidden\{display:none!important\}/,'Filtro R180 debe prevalecer sobre display:grid!important de R133');
assert.match(moduleSrc,/card\.classList\.toggle\('r180-filter-hidden',!show\)/,'Debe ocultar mediante clase persistente');
assert.match(moduleSrc,/visibleCount===0/,'Estado vacío debe calcularse con el filtro real');
assert.match(moduleSrc,/data\.r180RequestCategory=category|dataset\.r180RequestCategory=category/,'Debe etiquetar categoría por tarjeta');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R180'/,'Loader debe forzar versión R180');

assert.match(moduleSrc,/data-r181-state-tabs hidden/,'Activas/Finalizadas debe estar oculto por defecto');
assert.match(moduleSrc,/const useStateFilter=typeSelected==='otras'/,'Filtro de estado debe aplicar solo a Otras');
assert.match(moduleSrc,/stateTabs\.hidden=!useStateFilter/,'Debe mostrar Activas/Finalizadas solo al seleccionar Otras');
assert.match(moduleSrc,/window\.state\.r179SolicitudesType='otras'/,'Al finalizar debe llevar a Otras');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R181'/,'Loader debe forzar versión R181');

assert.match(moduleSrc,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/,'Categorías deben quedar en cuadrícula alineada de 4 columnas en escritorio');
assert.match(moduleSrc,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'Filtros de estado deben quedar alineados en 2 columnas');
assert.match(moduleSrc,/width:100%!important/,'Botones de filtros deben ocupar el ancho de su celda');
assert.match(moduleSrc,/height:42px!important/,'Botones de filtros deben tener altura uniforme');

assert.doesNotMatch(moduleSrc,/data-r179-type="todas"/,'No debe existir pestaña Todas');
assert.match(moduleSrc,/r179SolicitudesType='vacaciones'/,'Vacaciones debe ser la categoría inicial');
assert.match(moduleSrc,/const typeMatch=category===typeSelected/,'Cada solicitud debe pertenecer solo a su categoría');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R182'/,'Loader debe forzar versión R182');
