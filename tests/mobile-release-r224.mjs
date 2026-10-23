import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('index.html'),theme=read('assets/stainher-v1524-theme.js');
const nav=read('assets/stainher-v1524-navigation-stability.js');
const release=JSON.parse(read('release.json'));
const watcher=read('assets/stainher-v1524-release-refresh-r225.js');
test('R225 release manifest and navigation agree',()=>{
 assert.equal(release.version,'V15.24');
 assert.equal(release.revision,'R225');
 assert.match(nav,/const REVISION='R225'/);
 assert.match(html,/revision:'R225'/);
});
test('Index refreshes stale module URLs and preloaded copies',()=>{
 assert.match(html,/function runtimeUrl\(source\)/);
 assert.match(html,/script\.src=runtimeUrl\(module\.src\)/);
 assert.match(html,/link\.href=runtimeUrl\(module\.src\)/);
 assert.match(html,/20261022-r225-pwa-cache-refresh/);
 assert.match(theme,/20261022-r225-pwa-cache-refresh/);
});
test('Release watcher observes mobile return and avoids reload loops',()=>{
 assert.match(html,/stainher-v1524-release-refresh-r225\.js/);
 assert.match(watcher,/visibilitychange/);
 assert.match(watcher,/pageshow/);
 assert.match(watcher,/credentials:'same-origin'/);
 assert.match(watcher,/searchParams\.get\('app_rev'\)===next/);
 assert.match(watcher,/location\.replace\(target\.href\)/);
});
test('Mobile header and bottom navigation remain legible',()=>{
 assert.match(html,/stainher-r225-mobile-header-guarantee/);
 assert.match(theme,/#v151MobileHead/);
 assert.match(theme,/#v151MobileBottom/);
});
test('Inline R225 loader syntax parses',()=>{
 const pattern=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
 let seen=0;
 for(const match of html.matchAll(pattern)){
   const code=match[1].trim();if(!code)continue;
   assert.doesNotThrow(()=>new Function(code),`Inline script ${++seen} must parse`);
 }
 assert.ok(seen>0);
});
