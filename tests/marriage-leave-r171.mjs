import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-marriage-leave-r171.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const mail=fs.readFileSync('supabase/functions/send-request-approval-email/index.ts','utf8');
const migration=fs.readFileSync('supabase/migrations/20261021190500_permisos_legales_r171.sql','utf8');

assert.match(moduleSrc,/Permiso por matrimonio \/ AUC/,'Debe mostrar permiso matrimonio/AUC');
assert.match(moduleSrc,/Permiso por fallecimiento familiar/,'Debe mostrar permiso por fallecimiento');
assert.match(moduleSrc,/Permiso por nacimiento de hijo/,'Debe mostrar permiso por nacimiento');

assert.match(moduleSrc,/Art\. 207 bis/,'Debe mostrar referencia legal de matrimonio');
assert.match(moduleSrc,/Art\. 66/,'Debe mostrar referencia legal de fallecimiento');
assert.match(moduleSrc,/Art\. 195/,'Debe mostrar referencia legal de nacimiento');

assert.match(moduleSrc,/Hijo\/a · 10 días corridos/,'Debe contemplar 10 días por fallecimiento de hijo');
assert.match(moduleSrc,/Cónyuge \/ conviviente civil · 7 días corridos/,'Debe contemplar 7 días por cónyuge o conviviente civil');
assert.match(moduleSrc,/Hijo\/a en gestación · 7 días hábiles/,'Debe contemplar 7 días hábiles por hijo en gestación');
assert.match(moduleSrc,/Padre · 4 días hábiles/,'Debe contemplar 4 días hábiles por padre');
assert.match(moduleSrc,/Madre · 4 días hábiles/,'Debe contemplar 4 días hábiles por madre');
assert.match(moduleSrc,/Hermano\/a · 4 días hábiles/,'Debe contemplar 4 días hábiles por hermano');

assert.match(moduleSrc,/5 días de permiso pagado/,'Debe contemplar 5 días por nacimiento');
assert.match(moduleSrc,/Distribuido dentro del primer mes/,'Debe permitir modalidad distribuida de nacimiento');
assert.match(moduleSrc,/Continuo desde el nacimiento/,'Debe permitir modalidad continua');

assert.match(moduleSrc,/feriados_vacaciones/,'Debe usar la tabla de feriados para días hábiles');
assert.match(moduleSrc,/businessCount/,'Debe validar días hábiles');
assert.match(moduleSrc,/endByBusinessDays/,'Debe calcular término de permisos hábiles');

assert.match(moduleSrc,/crear_solicitud_legal_r171/,'Debe guardar permisos legales con RPC dedicada');
assert.match(moduleSrc,/marcar_certificado_permiso_legal_r171/,'Debe permitir registrar recepción de certificado');
assert.match(moduleSrc,/Certificado pendiente/,'Debe mostrar control de certificado pendiente');
assert.match(moduleSrc,/Certificado recibido/,'Debe mostrar control de certificado recibido');

assert.match(migration,/permiso_legal_tipo/,'Debe persistir tipo legal');
assert.match(migration,/permiso_legal_fecha_evento/,'Debe persistir fecha del evento');
assert.match(migration,/permiso_legal_certificado_estado/,'Debe persistir estado del certificado');
assert.match(migration,/registrar_permiso_legal_turno_r171/,'Debe registrar permiso aprobado en Turnos y Novedades');
assert.match(migration,/on conflict\(solicitud_id\)/,'Registro en Turnos no debe duplicarse');

assert.match(loader,/stainher-v1524-marriage-leave-r171\.js/,'Loader debe cargar R171');
assert.match(loader,/StainherMarriageLeaveR171\?\.install/,'Loader debe instalar R171');
assert.match(loader,/await refreshMarriageLeaveR171\(\)/,'R171 debe cargarse después del flujo de solicitudes');

assert.match(mail,/permiso_matrimonio:"Permiso por matrimonio \/ AUC"/,'Correo debe etiquetar matrimonio');
assert.match(mail,/permiso_fallecimiento:"Permiso por fallecimiento familiar"/,'Correo debe etiquetar fallecimiento');
assert.match(mail,/permiso_nacimiento:"Permiso por nacimiento de hijo"/,'Correo debe etiquetar nacimiento');

new Function(moduleSrc);
new Function(loader);
console.log('legal-leave-r171: ok');

assert.match(moduleSrc,/Este dato es informativo y no bloquea la solicitud/,'La anticipación debe quedar solo como registro informativo');
assert.match(moduleSrc,/La solicitud puede enviarse igualmente/,'Debe permitir solicitudes con poca anticipación');
assert.doesNotMatch(moduleSrc,/inferior a 30 días/,'No debe advertir como incumplimiento bloqueante por menos de 30 días');

assert.match(moduleSrc,/v1522ReqForm/,'Debe soportar el formulario productivo v1522');
assert.match(moduleSrc,/v1520ReqForm/,'Debe soportar formulario productivo anterior v1520');
assert.match(moduleSrc,/document\.querySelector\('#modalRoot form'\)/,'Debe tener fallback genérico para variantes del modal');
assert.match(moduleSrc,/event\.stopImmediatePropagation\(\)/,'Permisos legales deben interceptar el submit productivo');
assert.match(moduleSrc,/const data=await createLegalRequest\(o\)/,'Formulario productivo debe usar RPC de permisos legales');
assert.match(moduleSrc,/MutationObserver/,'Debe reinyectar opciones si el modal es reemplazado por otro runtime');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R172'/,'Loader debe forzar versión R172');
