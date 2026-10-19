import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-contract-standardization-r162.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(moduleSrc,/Estandarización e Innovación/,'Debe mostrar la ficha Estandarización e Innovación');
assert.match(moduleSrc,/\.v1520-tabs/,'Debe soportar la barra contractual productiva v1520');
assert.match(moduleSrc,/ggrr\.insertAdjacentElement\('afterend',btn\)/,'La ficha debe ubicarse inmediatamente después de Gastos Reembolsables');
assert.doesNotMatch(moduleSrc,/Comunicados e informes.*insertAdjacentElement/s,'No debe mover la ficha Comunicados e informes');
assert.match(moduleSrc,/\.eq\('tipo_imputacion','estandarizacion'\)/,'Debe cargar presupuestos imputados a Estandarización');
assert.match(moduleSrc,/\.not\('estado_pago_id','is',null\)/,'Solo debe listar presupuestos asociados a un EDP');
assert.match(moduleSrc,/id="r162EpSelect"/,'Debe permitir seleccionar Estado de Pago');
assert.match(moduleSrc,/Monto neto/,'Debe mostrar monto neto');
assert.match(moduleSrc,/Total IVA incluido/,'Debe mostrar total IVA incluido');
assert.match(moduleSrc,/Presupuestos asignados/,'Debe mostrar cantidad de presupuestos asignados');
assert.match(moduleSrc,/budgetDetail\(row\)/,'Debe mostrar el detalle real del presupuesto');
assert.match(moduleSrc,/No hay presupuestos asignados a Estandarización e Innovación/,'Debe mostrar estado vacío por EDP');
assert.match(moduleSrc,/data-r165-report>Generar informe/,'Debe mostrar botón Generar informe');
assert.match(moduleSrc,/async function downloadReport\(\)/,'Debe implementar descarga del informe');
assert.match(moduleSrc,/Informe de Estandarización e Innovación/,'PDF debe usar título corporativo');
assert.match(moduleSrc,/Presupuestos: \$\{filtered\.length\}/,'PDF debe incluir cantidad de presupuestos');
assert.match(moduleSrc,/Monto neto: \$\{money\(net\)\}/,'PDF debe incluir monto neto');
assert.match(moduleSrc,/IVA: \$\{money\(iva\)\}/,'PDF debe incluir IVA');
assert.match(moduleSrc,/Total IVA incluido: \$\{money\(total\)\}/,'PDF debe incluir total IVA incluido');
assert.match(moduleSrc,/doc\.autoTable/,'PDF debe incluir tabla de detalle');
assert.match(moduleSrc,/Estandarizacion_Innovacion_EP\$\{ep\.ep_num\}\.pdf/,'Archivo debe identificar el EDP');
assert.match(moduleSrc,/function wrapSetContractTab\(\)/,'Debe integrarse con el router contractual productivo');
assert.match(moduleSrc,/stainher:runtime-r163-ready/,'Debe reinstalarse al completar el loader R163');

assert.match(loader,/stainher-v1524-contract-standardization-r162\.js/,'El loader debe cargar la ficha R162');
assert.match(loader,/StainherContractStandardizationR162\?\.install/,'El loader debe instalar R162');
assert.match(loader,/stainher:contract-standardization-r162-ready/,'El loader debe emitir evento R162');

new Function(moduleSrc);
new Function(loader);

console.log('contract-standardization-r162: ok');
