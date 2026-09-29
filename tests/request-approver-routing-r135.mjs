import assert from 'node:assert/strict';
import fs from 'node:fs';

const route=fs.readFileSync('assets/stainher-v1524-request-approver-r135.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260928213000_request_approver_r135.sql','utf8');

assert.match(route,/REQUEST_APPROVER_R135__===BUILD/,'R135 debe quedar activo');
assert.match(route,/clagos@stainher\.cl/,'Cristian Lagos debe ser el aprobador preferido');
assert.match(route,/aprueba_administrador/,'Debe cargar solo perfiles habilitados para aprobar Administrador');
assert.match(route,/data-r135-approver/,'El formulario debe incluir selector de aprobador');
assert.match(route,/Por defecto tus solicitudes se envían a Cristian Lagos/,'La UI debe explicar el destino predeterminado');
assert.match(route,/crear_solicitud_propia_v135/,'La creación debe usar la RPC R135');
assert.match(route,/p_aprobador_user_id/,'La creación debe enviar el aprobador seleccionado');
assert.match(route,/Reenviar a Cristian Lagos/,'Debe permitir reenviar solicitudes aprobadas');
assert.match(route,/Enviar a Cristian Lagos/,'Debe permitir corregir solicitudes pendientes mal asignadas');
assert.match(route,/reenviar_solicitud_aprobador_v135/,'Debe usar RPC segura para reenviar');
assert.match(route,/v1517SendRequestApprovalEmail/,'El reenvío debe notificar por correo al nuevo aprobador');
assert.match(route,/solicitante_user_id/,'El control debe limitar el reenvío a solicitudes propias');

assert.match(migration,/create or replace function public\.crear_solicitud_propia_v135/,'Debe crear RPC de solicitud R135');
assert.match(migration,/lower\(coalesce\(p\.email,''\)\)='clagos@stainher\.cl'/,'Servidor debe resolver Cristian Lagos por correo');
assert.match(migration,/t\.aprueba_administrador=true/,'Servidor debe validar aprobadores habilitados');
assert.match(migration,/Cristian Lagos no está disponible/,'Debe fallar con mensaje claro si no está disponible');
assert.match(migration,/create or replace function public\.reenviar_solicitud_aprobador_v135/,'Debe crear RPC de reenvío');
assert.match(migration,/v_role<>'administrador'/,'Solo Administrador puede reenviar');
assert.match(migration,/r\.solicitante_user_id is distinct from v_uid/,'Administrador solo reenvía sus propias solicitudes desde este control');
assert.match(migration,/set estado='pendiente'/,'Una solicitud aprobada reenviada debe volver a pendiente');
assert.match(migration,/Solicitud reenviada para aprobación/,'Debe crear nueva notificación interna');
assert.match(migration,/vacaciones ya finalizadas por RR\.HH\./,'No debe reabrir vacaciones ya finalizadas');

assert.match(loader,/HP_LOADER_VERSION__='R136'/,'Loader debe quedar consolidado en R136');
assert.match(loader,/refreshRequestApproverR135/,'Loader debe cargar R135');
assert.match(loader,/stainher-v1524-request-approver-r135\.js/,'Loader debe cargar el módulo de enrutamiento');
assert.match(loader,/StainherRequestApproverR135\?\.install/,'Loader debe instalar R135');
assert.match(loader,/stainher:runtime-r135-ready/,'Loader debe emitir evento R135');
assert.match(loader,/refreshSolicitudesViewR133/,'R133 debe conservarse');
assert.match(loader,/refreshEquipmentViewR132/,'R132 debe conservarse');

new Function(route);
new Function(loader);
console.log('request-approver-routing-r135: ok');
