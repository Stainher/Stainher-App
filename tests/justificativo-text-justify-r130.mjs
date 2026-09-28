import assert from 'node:assert/strict';
import fs from 'node:fs';

const just=fs.readFileSync('stainher-justificativos-r19.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.match(just,/20260928-r130-justificativo-text-justify/,'Debe cargar build R130');
assert.match(just,/v1524-letter-preview \.v1524-justified\{text-align:justify/,'La vista previa debe justificar el cuerpo');
assert.match(just,/class="v1524-justified"/,'Los párrafos principales deben usar la clase justificada');
assert.match(just,/\{text:letterText\(x\),justify:true\}/,'El cuerpo principal del certificado debe marcarse como justificado');
assert.match(just,/align:'justify',maxWidth:180/,'El PDF debe renderizar el cuerpo con alineación justificada');
assert.match(just,/\{text:'De nuestra consideración:',justify:false\}/,'El saludo debe conservar alineación normal');
assert.match(just,/\{text:'Sin otro particular, saluda atentamente,',justify:false\}/,'El cierre debe conservar alineación normal');
assert.match(just,/justifiedText:true/,'Debe marcar la función R130 activa');
assert.match(index,/stainher-justificativos-r19\.js\?build=20260928-r130-justificativo-text-justify/,'Index debe invalidar cache');

new Function(just);
console.log('justificativo-text-justify-r130: ok');
