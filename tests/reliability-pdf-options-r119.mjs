import assert from 'node:assert/strict';
import fs from 'node:fs';

const pdf=fs.readFileSync('assets/stainher-v1524-reliability-actions.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(pdf,/RELIABILITY_ACTIONS_VERSION__ = VERSION/,'Debe marcar la versión activa del módulo de Confiabilidad');
assert.match(pdf,/const VERSION='R119'/,'La corrección debe identificarse como R119');
assert.match(pdf,/function reliabilityPdfOptionsFromModal\(current=\{\}\)/,'Debe leer las opciones visibles del modal');
assert.match(pdf,/historial.*historial.*intervenciones/s,'Debe reconocer la opción Historial');
assert.match(pdf,/metodolog\[ií\]a.*c\[aá\]lculo/s,'Debe reconocer la opción Metodología');
assert.match(pdf,/r\.opt=reliabilityPdfOptionsFromModal\(r\.opt\|\|\{\}\)/,'El PDF debe sincronizar las opciones justo antes de generarse');
assert.match(pdf,/review\.opt=reliabilityPdfOptionsFromModal\(review\.opt\|\|\{\}\)/,'La aprobación también debe conservar las opciones seleccionadas');
assert.match(pdf,/Historial de fallas \/ intervenciones/,'El PDF debe titular la sección de historial');
assert.match(pdf,/y=\(doc\.lastAutoTable\?\.finalY\|\|y\)\+8/,'Debe avanzar el cursor después de la tabla de historial');
assert.match(pdf,/if\(opt\.metodologia===true\)/,'Debe generar la metodología cuando fue seleccionada');
assert.match(loader,/refreshReliabilityActionsR119/,'El cargador debe refrescar la corrección R119');
assert.match(loader,/stainher-v1524-reliability-actions\.js/,'Debe cargar el módulo actualizado de Confiabilidad');
assert.match(loader,/HP_LOADER_VERSION__='R119'/,'El cargador debe quedar consolidado como R119');

new Function(pdf);
new Function(loader);

console.log('reliability-pdf-options-r119: ok');
