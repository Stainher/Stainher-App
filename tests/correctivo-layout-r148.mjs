import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../assets/stainher-v1524-corrective-times-r147.js',import.meta.url),'utf8');

test('R148 amplía y alinea columnas del historial',()=>{
  assert.match(source,/1750px/);
  assert.match(source,/r147-col-arrival/);
  assert.match(source,/r147-col-finish/);
  assert.match(source,/text-align:center/);
  assert.match(source,/overflow-wrap:break-word/);
  assert.match(source,/text-overflow:clip/);
});

test('R148 muestra observaciones completas sin line clamp',()=>{
  assert.match(source,/stainher-corr-observation-preview-r118/);
  assert.match(source,/-webkit-line-clamp:unset/);
  assert.match(source,/overflow:visible/);
});

test('R148 alinea también las tablas PDF',()=>{
  assert.match(source,/halign:centered/);
  assert.match(source,/valign:'middle'/);
  assert.match(source,/overflow:'linebreak'/);
  assert.match(source,/headStyles/);
  assert.match(source,/margin=.*left:14,right:14/s);
});

new Function(source);
console.log('correctivo-layout-r148: ok');
