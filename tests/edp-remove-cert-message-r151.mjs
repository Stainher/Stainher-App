import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('assets/stainher-v1524-edp-quarterly-certification-r149.js','utf8');

assert.match(src,/R151 · Certificación trimestral en EDP sin bloque informativo/,'Debe identificar R151');
assert.doesNotMatch(src,/r149-quarterly-box/,'No debe mostrar el bloque informativo azul');
assert.doesNotMatch(src,/ensureActivityBox/,'No debe reconstruir el mensaje de certificación');
assert.match(src,/Certificación trimestral/,'Debe conservar la conciliación contractual');
assert.match(src,/data-r149-cert-kpi/,'Debe conservar KPI de certificación');
assert.match(src,/El detalle concilia:/,'Debe conservar validación correcta del EP17');
assert.match(src,/totalCertification:TOTAL_CERT/,'Debe conservar el total de certificación para la lógica');

new Function(src);
console.log('edp-remove-cert-message-r151: ok');
