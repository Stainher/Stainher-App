import assert from 'node:assert/strict';
import fs from 'node:fs';

const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const audit=fs.readFileSync('assets/stainher-v1524-runtime-audit.js','utf8');

assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R163'/,'Loader debe usar guard R163');
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__='R163'/,'Loader debe registrar versión R163');
assert.match(loader,/20261019-r163-force-contract-standardization/,'Loader debe usar build R163');
assert.match(loader,/stainher-v1524-contract-standardization-r162\.js/,'R163 debe cargar la ficha R162');
assert.match(loader,/StainherContractStandardizationR162\?\.install/,'R163 debe instalar la ficha R162');
assert.match(loader,/StainherHPR163=api/,'Debe exponer API R163');
assert.match(loader,/bootstrapR163=bootstrapR135/,'Debe exponer bootstrap R163');
assert.match(loader,/stainher:runtime-r163-ready/,'Debe emitir evento R163');

assert.match(audit,/stainher-v1524-hp-loader-r72\.js\?build=\$\{BUILD\}-\$\{Date\.now\(\)\}/,'Runtime audit debe solicitar el loader con cache bust por sesión');

new Function(loader);
new Function(audit);
console.log('loader-r163-force-r162: ok');
