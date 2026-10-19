import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-contract-standardization-r162.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(moduleSrc,/Estandarización e Innovación/,'Debe mostrar la ficha Estandarización e Innovación');
assert.match(moduleSrc,/ggrr\.insertAdjacentElement\('afterend',btn\)/,'La ficha debe ubicarse inmediatamente después de Gastos Reembolsables');
assert.match(moduleSrc,/\.eq\('tipo_imputacion','estandarizacion'\)/,'Debe cargar presupuestos imputados a Estandarización');
assert.match(moduleSrc,/\.not\('estado_pago_id','is',null\)/,'Solo debe listar presupuestos asociados a un EDP');
assert.match(moduleSrc,/id="r162EpSelect"/,'Debe permitir seleccionar Estado de Pago');
assert.match(moduleSrc,/Monto neto/,'Debe mostrar monto neto');
assert.match(moduleSrc,/Total IVA incluido/,'Debe mostrar total IVA incluido');
assert.match(moduleSrc,/Presupuestos asignados/,'Debe mostrar cantidad de presupuestos asignados');
assert.match(moduleSrc,/budgetDetail\(row\)/,'Debe mostrar el detalle real del presupuesto');
assert.match(moduleSrc,/No hay presupuestos asignados a Estandarización e Innovación/,'Debe mostrar estado vacío por EDP');

assert.match(loader,/stainher-v1524-contract-standardization-r162\.js/,'El loader debe cargar la ficha R162');
assert.match(loader,/StainherContractStandardizationR162\?\.install/,'El loader debe instalar R162');
assert.match(loader,/stainher:contract-standardization-r162-ready/,'El loader debe emitir evento R162');

new Function(moduleSrc);
new Function(loader);

console.log('contract-standardization-r162: ok');
