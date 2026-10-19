import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSrc=fs.readFileSync('assets/stainher-presupuestos-history-r150.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');

assert.match(moduleSrc,/R150 · Detalle visible en histórico de Presupuestos/,'Debe identificar R150');
assert.match(moduleSrc,/data-r150-detail/,'Debe agregar acción Detalle');
assert.match(moduleSrc,/Materiales/,'Debe mostrar materiales');
assert.match(moduleSrc,/Fletes o transportes/,'Debe mostrar fletes');
assert.match(moduleSrc,/Resumen económico/,'Debe mostrar resumen económico');
assert.match(moduleSrc,/Observación:/,'Debe mostrar observación');
assert.match(moduleSrc,/Venta neta/,'Debe mostrar venta neta');
assert.match(moduleSrc,/IVA \(19%\)/,'Debe mostrar IVA');
assert.match(moduleSrc,/Total/,'Debe mostrar total');
assert.match(moduleSrc,/Ocultar/,'Debe permitir contraer detalle');
assert.match(moduleSrc,/MutationObserver/,'Debe seguir funcionando cuando se rerenderiza el histórico');

assert.match(loader,/stainher-presupuestos-history-r150\.js/,'Loader debe cargar R150');
assert.match(loader,/StainherPresupuestosHistoryR150\?\.install/,'Loader debe instalar R150');
assert.match(loader,/stainher:presupuestos-r150-ready/,'Loader debe emitir evento R150');

new Function(moduleSrc);
new Function(loader);
console.log('presupuestos-history-detail-r150: ok');
