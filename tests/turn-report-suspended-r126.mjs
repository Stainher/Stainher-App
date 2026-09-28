import assert from 'node:assert/strict';
import fs from 'node:fs';

const report=fs.readFileSync('assets/stainher-v1524-report-hotfix4.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(report,/REPORT_HOTFIX_R126/,'R126 debe ser la corrección activa');
assert.match(report,/ensureSuspendedColumn/,'Debe restaurar la columna Suspendido');
assert.doesNotMatch(report,/removeSuspendedColumn\(summary/,'No debe ocultar Suspendido en el resumen');
assert.match(report,/Suspendido encierro/,'Debe mostrar el encabezado Suspendido encierro');
assert.match(report,/Suspendido por encierro':x\.suspendido/,'Excel debe incluir Suspendido por encierro');
assert.match(report,/\['Colaborador','Enc\. dentro','Enc\. fuera','Suspendido'/,'PDF debe incluir la columna Suspendido');
assert.match(report,/\['ET','EF','SE','Día extra \(DA\)','HE','HF'\]/,'Totales operativos PDF deben incluir SE');
assert.match(report,/code:'SE'/,'Tarjetas operativas deben incluir SE');
assert.match(report,/repeat\(6,minmax\(0,1fr\)\)/,'La grilla debe admitir seis totales operativos');
assert.match(report,/foot\.children\[idx\].*total/s,'TOTAL SELECCIÓN debe alinear el total suspendido');

assert.match(loader,/HP_LOADER_VERSION__='R126'/,'Loader debe quedar en R126');
assert.match(loader,/stainher-turn-report-hotfix-runtime-r126/,'Loader debe recargar la corrección R126');
assert.match(loader,/stainher:turn-report-r126-ready/,'Debe emitir evento R126');
assert.match(loader,/stainher-v1524-edp-inline-r125\.js/,'R125 debe conservarse');
assert.match(loader,/stainher-v1524-forecast-history-r124\.js/,'R124 debe conservarse');

new Function(report);
new Function(loader);
console.log('turn-report-suspended-r126: ok');
