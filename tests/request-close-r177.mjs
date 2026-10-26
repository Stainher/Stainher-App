import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-request-close-r177.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261021204500_finalizar_solicitudes_r177.sql','utf8');

assert.match(moduleSrc,/Marcar como finalizada/,'Debe ofrecer cierre operacional');
assert.match(moduleSrc,/data-r178-tab="activas"/,'Debe incorporar pestaña Activas');
assert.match(moduleSrc,/data-r178-tab="finalizadas"/,'Debe incorporar pestaña Finalizadas');
assert.match(moduleSrc,/data-r178-final-count/,'Debe mostrar contador de solicitudes finalizadas');
assert.match(moduleSrc,/No hay otras solicitudes finalizadas\./,'El estado vacío debe respetar categoría Otras');
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
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 177, 'El cargador activo debe preservar al menos R177 (request-close-r177)');

new Function(moduleSrc);
new Function(loader);
console.log('request-close-r177: ok');

assert.match(moduleSrc,/data-r179-type="vacaciones"/,'Debe separar vacaciones');
assert.match(moduleSrc,/data-r179-type="permisos"/,'Debe separar permisos');
assert.match(moduleSrc,/data-r179-type="otras"/,'Debe separar otras solicitudes');
assert.match(moduleSrc,/function requestCategory\(type\)/,'Debe clasificar solicitudes por tipo');
assert.match(moduleSrc,/window\.state\.r178SolicitudesTab='finalizadas'/,'Al finalizar debe mover inmediatamente a la pestaña Finalizadas');
assert.match(moduleSrc,/Object\.assign\(local,/,'Debe actualizar el estado local inmediatamente después del cierre');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 179, 'El cargador activo debe preservar al menos R179 (request-close-r177)');

assert.match(moduleSrc,/r180-filter-hidden\{display:none!important\}/,'Filtro R180 debe prevalecer sobre display:grid!important de R133');
assert.match(moduleSrc,/card\.classList\.toggle\('r180-filter-hidden',!show\)/,'Debe ocultar mediante clase persistente');
assert.match(moduleSrc,/visibleCount===0/,'Estado vacío debe calcularse con el filtro real');
assert.match(moduleSrc,/data\.r180RequestCategory=category|dataset\.r180RequestCategory=category/,'Debe etiquetar categoría por tarjeta');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 180, 'El cargador activo debe preservar al menos R180 (request-close-r177)');

assert.match(moduleSrc,/data-r181-state-tabs hidden/,'Activas/Finalizadas debe estar oculto por defecto');
assert.match(moduleSrc,/const useStateFilter=typeSelected==='otras'/,'Filtro de estado debe aplicar solo a Otras');
assert.match(moduleSrc,/stateTabs\.hidden=!useStateFilter/,'Debe mostrar Activas/Finalizadas solo al seleccionar Otras');
assert.match(moduleSrc,/window\.state\.r179SolicitudesType='otras'/,'Al finalizar debe llevar a Otras');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 181, 'El cargador activo debe preservar al menos R181 (request-close-r177)');

assert.match(moduleSrc,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'Las tres categorías actuales deben distribuirse en tres columnas');
assert.match(moduleSrc,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'Filtros de estado deben quedar alineados en 2 columnas');
assert.match(moduleSrc,/width:100%!important/,'Botones de filtros deben ocupar el ancho de su celda');
assert.match(moduleSrc,/height:42px!important/,'Botones de filtros deben tener altura uniforme');

assert.doesNotMatch(moduleSrc,/data-r179-type="todas"/,'No debe existir pestaña Todas');
assert.match(moduleSrc,/r179SolicitudesType='vacaciones'/,'Vacaciones debe ser la categoría inicial');
assert.match(moduleSrc,/const typeMatch=category===typeSelected/,'Cada solicitud debe pertenecer solo a su categoría');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 182, 'El cargador activo debe preservar al menos R182 (request-close-r177)');

assert.match(moduleSrc,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'Vacaciones, Permisos y Otras deben ocupar 3 columnas iguales');
assert.match(moduleSrc,/data-r179-type="otras"\]\{\s*grid-column:1\/-1!important/s,'Otras debe ocupar ancho completo en móvil');
assert.match(moduleSrc,/\[data-r178-tabs\][\s\S]*box-sizing:border-box!important/,'Panel de filtros debe respetar la misma caja de la cuadrícula');
assert.match(moduleSrc,/\.v152-request-card\{[\s\S]*width:100%!important[\s\S]*box-sizing:border-box!important/,'Tarjetas deben usar ancho completo y misma retícula');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 183, 'El cargador activo debe preservar al menos R183 (request-close-r177)');

assert.match(moduleSrc,/\[data-r181-state-tabs\]\[hidden\][\s\S]*display:none!important/,'Activas/Finalizadas debe ocultarse realmente fuera de Otras');
assert.match(moduleSrc,/r184-state-tabs-hidden/,'Debe usar clase robusta para ocultar filtros de estado');
assert.match(loader,/stainher-r184-request-loading/,'Loader debe ocultar temporalmente el listado antiguo');
assert.match(loader,/Solicitudes primero: evita mostrar temporalmente el render antiguo/,'Solicitudes debe inicializarse antes de módulos pesados');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 184, 'El cargador activo debe preservar al menos R184 (request-close-r177)');

// R280: replace obsolete six-column assertions with responsive container tests.
assert.doesNotMatch(moduleSrc,/minmax\(340px,1\.65fr\)/,'No debe volver la retícula rígida de seis columnas');
assert.match(moduleSrc,/@container \(max-width:1050px\)/,'Debe adaptarse al ancho del listado');
assert.match(moduleSrc,/grid-column:1\/-1!important/,'Acciones deben ocupar fila completa');
assert.match(moduleSrc,/row\.created_at/,'Otras debe mostrar la fecha real de creación');
assert.match(moduleSrc,/requestCategory\(row\.tipo\)==='otras'/,'Solo Otras usa fecha de creación');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 280,'Cargador debe refrescar R280');
