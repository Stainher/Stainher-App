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
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 172, 'El cargador activo debe preservar al menos R172 (marriage-leave-r171)');

assert.match(moduleSrc,/Desde el mismo día del fallecimiento/,'Debe indicar inicio efectivo para fallecimiento directo');
assert.match(moduleSrc,/Desde el momento en que se acredita la muerte mediante certificado de defunción fetal/,'Debe indicar inicio efectivo de defunción fetal');
assert.match(moduleSrc,/días corridos'.*continuos|corridos\).*continuos/s,'Debe distinguir permisos corridos/continuos');
assert.match(moduleSrc,/Período calculado:/,'Debe mostrar el período exacto calculado');
assert.match(moduleSrc,/cantidad de días, si son hábiles o corridos, y desde cuándo se hace efectivo/,'Debe orientar al usuario antes de seleccionar');

assert.match(moduleSrc,/Comprobante PDF/,'Debe agregar botón para descargar comprobante');
assert.match(moduleSrc,/function buildPermitReceiptPdf\(row\)/,'Debe construir comprobante PDF');
assert.match(moduleSrc,/Comprobante de Permiso/,'Comprobante debe usar título estándar');
assert.match(moduleSrc,/installCorporatePdfV95|pdfHeader/,'Comprobante debe usar formato corporativo Stainher');
assert.match(moduleSrc,/PENDIENTE DE APROBACIÓN/,'Comprobante debe reflejar estado pendiente');
assert.match(moduleSrc,/APROBADA/,'Comprobante debe reflejar estado aprobado');
assert.match(moduleSrc,/RECHAZADA/,'Comprobante debe reflejar estado rechazado');
assert.match(moduleSrc,/Tipo de permiso/,'Comprobante debe incluir tipo de permiso');
assert.match(moduleSrc,/Aprobador asignado/,'Comprobante debe incluir aprobador');
assert.match(moduleSrc,/Fecha del hecho/,'Comprobante debe incluir fecha del evento legal');
assert.match(moduleSrc,/Duración/,'Comprobante debe incluir duración');
assert.match(moduleSrc,/await window\.v175DownloadPermitReceipt\?\.\(data\.id\)/,'Debe generar comprobante automáticamente al crear permiso legal');
assert.match(moduleSrc,/RECEIPT_TYPES=new Set\(\['permiso'/,'Debe incluir también permiso no remunerado en comprobantes');
assert.ok(Number(loader.match(/window\.__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1]) >= 175, 'El cargador activo debe preservar al menos R175 (marriage-leave-r171)');

assert.match(moduleSrc,/data-r176-permit-receipt/,'Debe marcar el botón único de comprobante');
assert.match(moduleSrc,/replace\(\/<button\[\^>\]\*onclick="v175DownloadPermitReceipt/,'Debe limpiar botones de comprobante heredados antes de renderizar');
assert.match(moduleSrc,/data-r176-legal-certificate/,'Debe marcar la acción única de certificado');
