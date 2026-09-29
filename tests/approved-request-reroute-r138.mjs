import assert from 'node:assert/strict';
import fs from 'node:fs';

const route=fs.readFileSync('assets/stainher-v1524-approved-reroute-r138.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260929163000_reassign_approved_requests_cristian_r138.sql','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(route,/APPROVED_REROUTE_R138__===BUILD/,'R138 debe quedar activo');
assert.match(route,/estado\|\|'\)!=='aprobada'/,'Solo debe habilitarse sobre solicitudes aprobadas');
assert.match(route,/Reasignar a Cristian Lagos/,'Debe mostrar la nueva acción');
assert.match(route,/role\(\)!=='administrador'/,'Solo Administrador debe ver la acción');
assert.match(route,/tipo\|\|'\)==='justificativo'/,'Justificativos deben quedar excluidos');
assert.match(route,/isFinalVacation/,'Vacaciones finalizadas por RR.HH. deben quedar excluidas');
assert.match(route,/reasignar_solicitud_aprobada_cristian_r138/,'Debe usar la RPC específica R138');
assert.match(route,/v1517SendRequestApprovalEmail/,'Debe notificar por correo a Cristian Lagos');
assert.match(route,/renderSolicitudesV15/,'Debe refrescar la bandeja después de reasignar');

assert.match(migration,/create or replace function public\.reasignar_solicitud_aprobada_cristian_r138/,'Debe crear RPC segura R138');
assert.match(migration,/v_role<>'administrador'/,'Solo Administrador puede ejecutar la reasignación');
assert.match(migration,/r\.estado<>'aprobada'/,'Servidor debe exigir solicitud aprobada');
assert.match(migration,/r\.tipo='justificativo'/,'Servidor debe excluir justificativos');
assert.match(migration,/r\.tipo='vacaciones'/,'Servidor debe proteger vacaciones');
assert.match(migration,/lower\(coalesce\(p\.email,''\)\)='clagos@stainher\.cl'/,'Servidor debe resolver a Cristian Lagos por correo');
assert.match(migration,/auditoria_v15/,'Debe conservar trazabilidad del aprobador anterior');
assert.match(migration,/aprobador_anterior_user_id/,'Auditoría debe guardar aprobador anterior');
assert.match(migration,/set estado='pendiente'/,'La solicitud debe volver a pendiente');
assert.match(migration,/etapa='aprobador'/,'Debe volver a etapa de aprobación');
assert.match(migration,/firma_aprobador=null/,'Debe limpiar la firma anterior para nueva aprobación');
assert.match(migration,/Solicitud aprobada reasignada/,'Debe crear notificación nueva');

assert.match(loader,/HP_LOADER_VERSION__='R138'/,'Loader debe quedar consolidado en R138');
assert.match(loader,/refreshApprovedRerouteR138/,'Loader debe cargar R138');
assert.match(loader,/stainher-v1524-approved-reroute-r138\.js/,'Loader debe cargar el módulo R138');
assert.match(loader,/StainherApprovedRerouteR138\?\.install/,'Loader debe instalar R138');
assert.match(loader,/stainher:approved-reroute-r138-ready/,'Loader debe emitir evento de módulo R138');
assert.match(loader,/stainher:runtime-r138-ready/,'Loader debe emitir runtime R138');
assert.match(loader,/refreshRequestApproverR135/,'R135 debe conservarse');
assert.match(loader,/refreshPreventivoStateR137/,'R137 debe conservarse');
assert.match(loader,/refreshSolicitudesViewR133/,'R133 debe conservarse');
assert.match(loader,/refreshEquipmentViewR132/,'R132 debe conservarse');

new Function(route);
new Function(loader);
console.log('approved-request-reroute-r138: ok');
