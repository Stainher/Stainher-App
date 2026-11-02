import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const release=JSON.parse(read('release.json'));
const BUILD=release.build;
const html=read('index.html'),theme=read('assets/stainher-v1524-theme.js');
const nav=read('assets/stainher-v1524-navigation-stability.js');
const watcher=read('assets/stainher-v1524-release-refresh-r231.js');

test('Current release manifest and navigation are version-aware',()=>{
  assert.equal(release.version,'V15.24');
  assert.ok(/^R[0-9]+$/.test(release.revision));
  assert.ok(/^[0-9]{8}-r[0-9]+-/.test(BUILD));
  assert.ok(nav.includes('const REVISION='));
  assert.ok(nav.includes('window.STAINHER_RELEASE?.revision'));
  assert.ok(nav.includes('normalizeVersion()'));
  assert.doesNotMatch(html,/V15\.23/);
});
test('Mobile shell retains the release notice and title synchronization',()=>{
  assert.ok(html.includes('stainher-v1524-release-refresh-r231.js'));
  assert.ok(!html.includes('stainher-v1524-release-refresh-r226.js'));
  assert.ok(nav.includes('Stainher App · ${VERSION} · ${REVISION}'));
  assert.ok(nav.includes('document.title=`Stainher App ${VERSION} ${REVISION}`'));
});
test('Index refreshes stale module URLs and preloaded copies',()=>{
  assert.match(html,/function runtimeUrl\(source\)/);
  assert.match(html,/script\.src=runtimeUrl\(module\.src\)/);
  assert.match(html,/link\.href=runtimeUrl\(module\.src\)/);
});

test('Update watcher checks the release before writing verified HTML',()=>{
  assert.ok(watcher.includes('visibilitychange'));
  assert.ok(watcher.includes('pageshow'));
  assert.ok(watcher.includes("credentials:'same-origin'"));
  assert.ok(watcher.includes("cache:'no-store'"));
  assert.ok(watcher.includes('number(data.revision)>number(current)'));
  assert.ok(watcher.includes('number(live)<number(revision)'));
  assert.ok(watcher.includes("document.write(html)"));
});
test('Inline current loader syntax parses',()=>{
  const pattern=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let seen=0;
  for(const match of html.matchAll(pattern)){
    const code=match[1].trim();if(!code)continue;
    assert.doesNotThrow(()=>new Function(code),`Inline script ${++seen} must parse`);
  }
  assert.ok(seen>0);
});
