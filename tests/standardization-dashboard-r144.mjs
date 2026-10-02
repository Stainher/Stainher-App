import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboard=fs.readFileSync('assets/stainher-v1524-standardization-dashboard-r144.js','utf8');
const bridge=fs.readFileSync('assets/stainher-v1524-standardization-access-r142.js','utf8');

assert.match(dashboard,/Avance total/);
assert.match(dashboard,/Avance por equipo/);
assert.match(dashboard,/type:'doughnut'/);
assert.match(dashboard,/indexAxis:'y'/);
assert.match(dashboard,/Informe PDF/);
assert.match(dashboard,/Informe de Estandarización/);
assert.match(dashboard,/doc\.autoTable/);
assert.match(dashboard,/Realizadas/);
assert.match(dashboard,/En proceso/);
assert.match(dashboard,/No realizadas/);
assert.match(bridge,/stainher-v1524-standardization-dashboard-r144\.js/);
assert.match(bridge,/standardization-dashboard-r144-ready/);

new Function(dashboard);
new Function(bridge);
console.log('standardization-dashboard-r144: ok');
