import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-marriage-leave-r171.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const mail=fs.readFileSync('supabase/functions/send-request-approval-email/index.ts','utf8');

assert.match(moduleSrc,/Permiso por matrimonio \/ AUC/,'Debe mostrar el nuevo tipo de solicitud');
assert.match(moduleSrc,/Art\. 207 bis del Código del Trabajo/,'Debe mostrar referencia legal correcta');
assert.match(moduleSrc,/5 días hábiles continuos de permiso pagado/,'Debe informar duración legal');
assert.match(moduleSrc,/30 días de anticipación/,'Debe informar aviso previo');
assert.match(moduleSrc,/certificado del Registro Civil debe presentarse dentro de los 30 días siguientes/,'Debe informar obligación posterior');
assert.match(moduleSrc,/option\.value=TYPE/,'Debe agregar el tipo al selector');
assert.match(moduleSrc,/name="matrimonio_tipo"/,'Debe distinguir Matrimonio y AUC');
assert.match(moduleSrc,/name="matrimonio_fecha"/,'Debe solicitar fecha de celebración');
assert.match(moduleSrc,/function legalComment\(o\)/,'Debe incorporar antecedente legal al comentario persistido');
assert.match(moduleSrc,/current\.call\(this,payload\)/,'Debe conservar el flujo de aprobación actual');
assert.match(moduleSrc,/weekdayCount|weekdaysMonFri/,'Debe mostrar referencia de cinco días hábiles');
assert.match(moduleSrc,/Los festivos también son inhábiles/,'Debe advertir consideración de festivos');

assert.match(loader,/stainher-v1524-marriage-leave-r171\.js/,'Loader debe cargar R171');
assert.match(loader,/StainherMarriageLeaveR171\?\.install/,'Loader debe instalar R171');
assert.match(loader,/await refreshMarriageLeaveR171\(\)/,'R171 debe cargarse después del flujo de solicitudes');

assert.match(mail,/permiso_matrimonio:"Permiso por matrimonio \/ AUC"/,'Correo debe mostrar etiqueta legible');

new Function(moduleSrc);
new Function(loader);
console.log('marriage-leave-r171: ok');
