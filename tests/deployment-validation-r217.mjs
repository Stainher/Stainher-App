import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const nav=read('assets/stainher-v1524-navigation-stability.js');
const theme=read('assets/stainher-v1524-theme.js');
const loader=read('assets/stainher-v1524-hp-loader-r72.js');
test('Required runtime files and entrypoint exist',()=>{
  assert.ok(existsSync('index.html'));
  for(const p of ['assets/stainher-v1524-theme.js','assets/stainher-v1524-navigation-stability.js','assets/stainher-v1524-hp-loader-r72.js'])
    assert.ok(existsSync(p),p);
});
test('Version synchronizer covers all revision numbers',()=>{
  assert.match(nav,/const REVISION='R\d+';/);
  assert.match(nav,/normalizeVersion\(\)/);
  assert.ok(nav.includes('\\bR\\d{2,4}\\b'),'Version normalizer must cover R206+');
});
test('The navigation and theme loaders use a revision cache key',()=>{
  assert.match(theme,/stainher-v1524-navigation-stability\.js/);
  assert.match(theme,/\?build=/);
  assert.match(loader,/const BUILD=/);
});
test('Theme styles retain light, modern and dark support',()=>{
  assert.match(theme,/LIGHT='light'/);
  assert.match(theme,/MODERN='modern'/);
  assert.match(theme,/DARK='dark'/);
});
test('Legacy dark contrast is overridden in the leadership module',()=>{
  assert.match(theme,/syncLeadershipR215/);
  assert.match(theme,/#page-liderazgo/);
});
