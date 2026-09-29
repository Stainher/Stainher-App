import assert from 'node:assert/strict';
import fs from 'node:fs';

const edge=fs.readFileSync('supabase/functions/send-request-approval-email/index.ts','utf8');
const index=fs.readFileSync('index.html','utf8');
const just=fs.readFileSync('stainher-justificativos-r19.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(edge,/withSupabase\(\{auth:"user"\}/,'El correo debe exigir sesión autenticada');
assert.match(edge,/from\("solicitudes_v15"\)/,'Debe resolver la solicitud desde servidor');
assert.match(edge,/const recipientId=stage==="rrhh"/,'Debe usar RR.HH. como autorizador en etapa RRHH');
assert.match(edge,/r\.aprobador_user_id/,'Debe usar el aprobador asignado en etapa jerárquica');
assert.match(edge,/from\("perfiles"\)/,'Debe resolver el correo del autorizador desde su perfil');
assert.match(edge,/El autorizador asignado no tiene un correo activo válido/,'Debe validar el correo del autorizador');
assert.match(edge,/solicitud:\$\{requestId\}:\$\{stageKey\}:\$\{recipientId\}/,'Debe evitar correos duplicados por solicitud y etapa');
assert.match(edge,/email_envios_v1518/,'Debe registrar trazabilidad de envío');
assert.match(edge,/Brevo/,'Debe enviar por el proveedor de correo configurado');
assert.match(edge,/Abrir Stainher App/,'El correo debe incluir acceso a la aplicación');
assert.match(edge,/\["aprobador","rrhh"\]\.includes\(stage\)/,'Solo debe enviar si existe una etapa pendiente de autorización');

assert.match(index,/async function v1517SendRequestApprovalEmail/,'Debe existir helper de correo para solicitudes');
assert.match(index,/send-request-approval-email/,'Las solicitudes normales deben invocar la Edge Function');
assert.match(index,/Solicitud enviada al aprobador y notificada por correo/,'Debe confirmar correo exitoso al crear');
assert.match(index,/RR\.HH\. fue notificado también por correo/,'Vacaciones deben notificar por correo al nuevo autorizador RRHH');

assert.match(just,/20260928-r134-request-approver-email/,'Justificativos deben cargar build R134');
assert.match(just,/v1517SendRequestApprovalEmail\?\.\(q\.data\?\.id\)/,'Justificativos deben notificar por correo a RRHH');
assert.match(just,/approverEmail:true/,'Debe marcar correo a autorizador activo');

assert.match(loader,/HP_LOADER_VERSION__='R135'/,'Loader debe quedar consolidado en R135');
console.log('request-approver-email-r134: ok');
