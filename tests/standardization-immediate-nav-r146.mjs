import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../assets/stainher-v1524-home-badges-compact.js',import.meta.url),'utf8');

test('R146 instala el acceso temprano de Estandarización',()=>{
  assert.match(source,/__STAINHER_STANDARDIZATION_IMMEDIATE_NAV_R146__/);
  assert.match(source,/20261002-r146-standardization-immediate-nav/);
  assert.match(source,/button\.dataset\.page='estandarizacion'/);
  assert.match(source,/stainher-v1524-standardization-access-r142\.js/);
  assert.match(source,/stainher-v1524-standardization-r141\.js/);
});

test('R146 conserva los roles autorizados y precarga al montar',()=>{
  for(const role of ['administrador','gerente','planificador','confiabilidad','prevencion','supervisor']){
    assert.ok(source.includes(`'${role}'`),`falta rol ${role}`);
  }
  assert.match(source,/preload\(\)\.then\(\(\)=>mount\(\)\)/);
  assert.match(source,/window\.renderEstandarizacion/);
});
