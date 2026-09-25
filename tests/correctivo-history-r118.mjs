import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-v1524-corrective-history-r118.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(moduleSrc,/CORRECTIVO_HISTORY_VERSION__='R118'/,'R118 debe ser la mejora activa');
assert.match(moduleSrc,/table-layout:fixed/,'El historial debe alinear columnas con layout fijo');
for(const cls of ['r118-col-fecha','r118-col-equipo','r118-col-guia','r118-col-responsable','r118-col-duracion','r118-col-estado','r118-col-observacion','r118-col-excluir','r118-col-motivo','r118-col-accion']){
  assert.ok(moduleSrc.includes(cls),`Falta clase de columna ${cls}`);
}
assert.match(moduleSrc,/stainher-corr-observation-r118/,'Debe existir control para abrir observación');
assert.match(moduleSrc,/Observación completa/,'Debe existir ventana de observación completa');
assert.match(moduleSrc,/fullObservation\(row,table/,'La observación debe recuperar el texto completo desde el estado cuando esté disponible');
assert.match(moduleSrc,/Historial_Correctivo_/,'Debe generar descarga identificable del historial');
assert.match(moduleSrc,/X\.utils\.aoa_to_sheet/,'Debe exportar a Excel cuando SheetJS esté disponible');
assert.match(moduleSrc,/downloadCsv/,'Debe existir respaldo CSV');
assert.match(moduleSrc,/!norm\(x\.label\)\.includes\('accion'\)/,'La columna Acción no debe exportarse');
assert.match(moduleSrc,/correctivoFrom/,'La descarga debe respetar el período seleccionado');
assert.match(loader,/stainher-v1524-corrective-history-r118\.js/,'El cargador autenticado debe cargar R118');
assert.match(loader,/refreshCorrectivoHistoryR118/,'El bootstrap debe ejecutar la mejora de Correctivo');
assert.match(loader,/HP_LOADER_VERSION__='R118'/,'El cargador debe quedar consolidado como R118');

new Function(moduleSrc);
new Function(loader);

console.log('correctivo-history-r118: ok');
