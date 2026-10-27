import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const BUILD='20261027-r293-hp-history-mobile';
const html=read('index.html'),theme=read('assets/stainher-v1524-theme.js');
const nav=read('assets/stainher-v1524-navigation-stability.js');
const release=JSON.parse(read('release.json'));
const watcher=read('assets/stainher-v1524-release-refresh-r231.js');

test('R293 release manifest, navigation and loader agree',()=>{
  assert.equal(release.version,'V15.24');
  assert.equal(release.revision,'R293');
  assert.equal(release.build,BUILD);
  assert.match(nav,/const REVISION='R293'/);
  assert.match(html,/revision:'R293'/);
  assert.match(html,new RegExp(BUILD));
  assert.match(theme,new RegExp(BUILD));
  assert.match(html,/app_build=R293/);
  assert.doesNotMatch(html,/app_build=R22[4567890]/);
  assert.doesNotMatch(html,/V15\.23/);
});

test('Installed mobile shell exposes the current release',()=>{
  assert.match(html,/stainher-v1524-release-refresh-r231\.js/);
  assert.doesNotMatch(html,/stainher-v1524-release-refresh-r226\.js/);
  assert.match(html,/stainher-r240-mobile-header-guarantee/);
  assert.match(html,/Stainher App · V15\.24 · R293/);
  assert.match(nav,/Stainher App · \$\{VERSION\} · \$\{REVISION\}/);
  assert.match(nav,/document\.title=`Stainher App \$\{VERSION\} \$\{REVISION\}`/);
});

test('Index refreshes stale module URLs and preloaded copies',()=>{
  assert.match(html,/function runtimeUrl\(source\)/);
  assert.match(html,/script\.src=runtimeUrl\(module\.src\)/);
  assert.match(html,/link\.href=runtimeUrl\(module\.src\)/);
});

test('Release watcher observes mobile return and only advances revisions',()=>{
  assert.match(watcher,/visibilitychange/);
  assert.match(watcher,/pageshow/);
  assert.match(watcher,/credentials:'same-origin'/);
  assert.match(watcher,/nextNumber<=currentNumber/);
  assert.match(watcher,/searchParams\.get\('app_rev'\)===next/);
  assert.match(watcher,/location\.replace\(target\.href\)/);
  assert.match(watcher,/setTimeout\(check,0\)/);
});

test('Inline R293 loader syntax parses',()=>{
  const pattern=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let seen=0;
  for(const match of html.matchAll(pattern)){
    const code=match[1].trim();if(!code)continue;
    assert.doesNotThrow(()=>new Function(code),`Inline script ${++seen} must parse`);
  }
  assert.ok(seen>0);
});
