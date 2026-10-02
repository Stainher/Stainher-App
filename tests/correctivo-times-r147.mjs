import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../assets/stainher-v1524-corrective-times-r147.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/stainher-v1524-hp-loader-r72.js',import.meta.url),'utf8');

test('R147 expone hora llegada y fin de actividad en historial',()=>{
  assert.match(source,/Hora llegada/);
  assert.match(source,/Fin actividad/);
  assert.match(source,/hora_inicio/);
  assert.match(source,/hora_termino/);
  assert.match(source,/fecha_termino/);
  assert.match(source,/stainher-corr-times-r147/);
});

test('R147 incorpora las horas en PDF mensual y Confiabilidad sin recalcular duración',()=>{
  assert.match(source,/wrapMonthlyPdf/);
  assert.match(source,/wrapReliabilityPdf/);
  assert.match(source,/enhanceAutoTableOptions/);
  assert.match(source,/duracion/);
  assert.doesNotMatch(source,/duracion_minutos\s*=/);
});

test('R147 se carga después de R118 desde el loader consolidado',()=>{
  assert.match(loader,/stainher-v1524-corrective-history-r118\.js/);
  assert.match(loader,/stainher-v1524-corrective-times-r147\.js/);
  assert.match(loader,/StainherCorrectivoTimesR147\?\.install/);
  assert.match(loader,/stainher:correctivo-times-r147-ready/);
});

new Function(source);
new Function(loader);
console.log('correctivo-times-r147: ok');
