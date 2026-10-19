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
assert.match(moduleSrc,/const mark=count\?'● ':'/,'Debe marcar los EDP que contienen datos');
assert.match(moduleSrc,/● = contiene datos/,'Debe mostrar la leyenda de la marca');
assert.match(moduleSrc,/epOptionHtml\(epId,rows\)/,'El selector debe calcular la marca usando los registros disponibles');
assert.match(moduleSrc,/Monto neto/,'Debe mostrar monto neto');
assert.match(moduleSrc,/Total IVA incluido/,'Debe mostrar total IVA incluido');
assert.match(moduleSrc,/Presupuestos asignados/,'Debe mostrar cantidad de presupuestos asignados');
assert.match(moduleSrc,/budgetDetail\(row\)/,'Debe mostrar el detalle real del presupuesto');
assert.match(moduleSrc,/No hay presupuestos asignados a Estandarización e Innovación/,'Debe mostrar estado vacío por EDP');
assert.match(moduleSrc,/data-r165-report>Generar informe/,'Debe mostrar botón Generar informe');
assert.match(moduleSrc,/async function downloadReport\(\)/,'Debe implementar descarga del informe');
assert.match(moduleSrc,/Informe de Estandarización e Innovación/,'PDF debe usar título corporativo');
assert.match(moduleSrc,/head:\[\['Presupuestos asignados','Monto neto','IVA','Total IVA incluido'\]\]/,'PDF debe incluir resumen corporativo de montos');
assert.match(moduleSrc,/body:\[\[String\(filtered\.length\),money\(net\),money\(iva\),money\(total\)\]\]/,'Resumen PDF debe usar los valores del EDP');
assert.match(moduleSrc,/doc\.autoTable/,'PDF debe incluir tabla de detalle');
assert.match(moduleSrc,/function requireCorporatePdf\(\)/,'Debe exigir el generador PDF corporativo');
assert.match(moduleSrc,/typeof window\.pdfHeader!=='function'/,'Debe bloquear la generación si falta el formato corporativo');
assert.match(moduleSrc,/corporateHeader\(doc,'Informe de Estandarización e Innovación',subtitle\)/,'Primera página debe usar pdfHeader corporativo');
assert.doesNotMatch(moduleSrc,/doc\.text\('STAINHER'/,'No debe usar encabezado manual simplificado');
assert.match(moduleSrc,/Registro fotográfico - Estandarización e Innovación/,'Páginas de fotografías deben usar encabezado corporativo');
assert.match(moduleSrc,/id="r170PhotoInput" type="file" accept="image\/\*" multiple/,'Debe permitir cargar varias fotografías desde el PC');
assert.match(moduleSrc,/data-r170-add-photo/,'Debe mostrar acción Agregar fotografías');
assert.match(moduleSrc,/async function normalizePhoto\(file\)/,'Debe procesar fotografías antes de incorporarlas');
assert.match(moduleSrc,/canvas\.toDataURL\('image\/jpeg',0\.84\)/,'Debe comprimir fotografías para el PDF');
assert.match(moduleSrc,/photosForEp\(epId\)/,'Las fotografías deben asociarse al EDP seleccionado');
assert.match(moduleSrc,/doc\.addImage\(photo\.dataUrl,'JPEG'/,'Debe incorporar fotografías al PDF');
assert.match(moduleSrc,/no se almacenan en la plataforma/,'Debe informar que las fotos son locales al informe');
assert.match(moduleSrc,/Estandarizacion_Innovacion_EP\$\{ep\.ep_num\}\.pdf/,'Archivo debe identificar el EDP');
assert.match(moduleSrc,/function wrapSetContractTab\(\)/,'Debe integrarse con el router contractual productivo');
assert.match(moduleSrc,/stainher:runtime-r163-ready/,'Debe reinstalarse al completar el loader R163');

assert.match(loader,/stainher-v1524-contract-standardization-r162\.js/,'El loader debe cargar la ficha R162');
assert.match(loader,/StainherContractStandardizationR162\?\.install/,'El loader debe instalar R162');
assert.match(loader,/stainher:contract-standardization-r162-ready/,'El loader debe emitir evento R162');

new Function(moduleSrc);
new Function(loader);

console.log('contract-standardization-r162: ok');
