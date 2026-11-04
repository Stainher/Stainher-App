import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const src=fs.readFileSync('assets/stainher-v1524-rit-r331.js','utf8');
new Function(src);
assert.doesNotMatch(src,/setInterval\(pulse,2500\)/);
assert.match(src,/new MutationObserver\(records=>/);
assert.match(src,/if\(!changed&&!missing\)return/);
assert.match(src,/window\.StainherRIT=Object\.freeze\(\{mount:syncMount\}\)/);
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 await page.setContent('<html><body><section id="page-liderazgo"></section></body></html>');
 await page.evaluate(()=>{window.state={session:{user:{id:'test-user'}}};window.StainherRITPDF={hasTemplate:async()=>true};});
 await page.addScriptTag({content:src});
 const initial=await page.evaluate(()=>({count:document.querySelectorAll('#rit-r331').length,html:document.querySelector('#rit-r331')?.innerHTML||''}));
 assert.equal(initial.count,1,'RIT montado al cargar');
 await page.evaluate(()=>window.StainherRIT.mount());
 const stable=await page.evaluate(()=>document.querySelector('#rit-r331')?.innerHTML);
 assert.equal(stable,initial.html,'Montar repetidamente no repinta formulario');
 await page.evaluate(()=>document.querySelector('#page-liderazgo').appendChild(document.createElement('div')));
 await page.waitForTimeout(200);
 const after=await page.evaluate(()=>document.querySelector('#rit-r331')?.innerHTML);
 assert.equal(after,initial.html,'Mutaciones ajenas no repintan RIT');
 await page.evaluate(()=>{document.querySelector('#page-liderazgo').replaceChildren()});
 await page.waitForFunction(()=>!!document.querySelector('#rit-r331'));
 assert.equal(await page.locator('#rit-r331').count(),1,'El módulo se recupera si es eliminado');
}finally {await browser.close()}
console.log('R367: se eliminó sondeo periódico, no repinta ante mutaciones irrelevantes y se remonta si falta');
