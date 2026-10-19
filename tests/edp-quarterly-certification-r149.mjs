import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-edp-quarterly-certification-r149.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(moduleSrc,/R149 · Certificación trimestral en EDP/,'Debe identificar R149');
assert.match(moduleSrc,/ep_num\)===17/,'Debe limitar la corrección a EP17');
assert.match(moduleSrc,/anio_edp\)===2026/,'Debe limitar a 2026');
assert.match(moduleSrc,/mes_edp\)===10/,'Debe limitar a octubre');
assert.match(moduleSrc,/item:90.*amount:2900230/s,'Debe registrar certificación ASEA');
assert.match(moduleSrc,/item:170.*amount:2900230/s,'Debe registrar certificación OTIS');
assert.match(moduleSrc,/item:230.*amount:940304/s,'Debe registrar certificación ALIMAK');
assert.match(moduleSrc,/item:340.*amount:2900230/s,'Debe registrar certificación PTP');
assert.match(moduleSrc,/item:400.*amount:1066214/s,'Debe registrar certificación Nodo 3700');
assert.match(moduleSrc,/item:480.*amount:816650/s,'Debe registrar certificación EILA');
assert.match(moduleSrc,/item:520.*amount:485214/s,'Debe registrar certificación Hilton');
assert.match(moduleSrc,/Mantenimiento base/,'Debe separar mantenimiento base');
assert.match(moduleSrc,/Certificación trimestral/,'Debe mostrar la actividad periódica');
assert.match(moduleSrc,/Total esperado equipos/,'Debe mostrar total esperado');
assert.match(moduleSrc,/El detalle concilia:/,'Debe conciliar mantenimiento + certificación');

const amounts=[2900230,2900230,940304,2900230,1066214,816650,485214];
assert.equal(amounts.reduce((a,b)=>a+b,0),12009072,'Certificación trimestral debe sumar $12.009.072');
assert.equal(30843324+12009072,42852396,'EP17 debe conciliar a $42.852.396');

assert.match(loader,/stainher-v1524-edp-quarterly-certification-r149\.js/,'Loader debe cargar R149');
assert.match(loader,/StainherEdpQuarterlyR149\?\.install/,'Loader debe instalar R149');
assert.match(loader,/stainher:edp-quarterly-r149-ready/,'Loader debe emitir evento R149');

new Function(moduleSrc);
new Function(loader);
console.log('edp-quarterly-certification-r149: ok');
