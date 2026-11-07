import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const disclosure=readFileSync('assets/stainher-v1524-default-open-panels.js','utf8');
const rit=readFileSync('assets/stainher-v1524-rit-r331.js','utf8');
const modal=readFileSync('assets/stainher-v1524-rit-control-modal-r390.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const access=readFileSync('assets/stainher-v1524-leadership-execution-access.js','utf8');
for(const script of [disclosure,rit,modal,loader,access])new Function(script);
assert.ok(Number(loader.match(/__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1])>=391,'R391 conserva su corrección en las versiones siguientes');
assert.match(access,/r391-20261106-rit-hidden/);
assert.match(rit,/ritStaging\(root\)\.appendChild\(el\)/);
assert.match(rit,/stainher-rit-stage-r391/);
assert.doesNotMatch(disclosure,/^\s*'Cumplimiento por usuario',?\s*$/m);
assert.doesNotMatch(disclosure,/^\s*'Controles realizados',?\s*$/m);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1200]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
  await page.setContent('<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+
   '<section id="page-liderazgo"><section id="v1512Lead_controles"><h3>Controles Stainher</h3>'+
   '<div class="controls-grid"><article class="control-card-v95"><h4>Check List de Camioneta</h4><button>Realizar ahora</button></article></div></section>'+
   '<details class="stainher-disclosure" data-stainher-disclosure="1" id="users" open><summary>Cumplimiento por usuario</summary><p>Datos</p></details>'+
   '<details class="stainher-disclosure" data-stainher-disclosure="1" id="history" open><summary>Controles realizados</summary><p>12 registros</p></details>'+
   '</section></body></html>');
  await page.evaluate(()=>{
   window.__STAINHER_ALL_CONTROL_EDITOR__=true;
   window.state={session:{user:{id:'tester'}},profile:{nombre:'Test'}};
   window.sb={from(){return {select(){return this},eq(){return this},order(){return Promise.resolve({data:[],error:null})}}}};
   window.StainherRITPDF={hasTemplate:async()=>true};
  });
  await page.addScriptTag({content:disclosure});
  await page.waitForTimeout(50);
  assert.equal(await page.locator('#users').evaluate(el=>el.open),false,'user summary starts collapsed');
  assert.equal(await page.locator('#history').evaluate(el=>el.open),false,'records starts collapsed');
  // Open manually, do not let navigation or subsequent DOM activity reset user preference.
  await page.locator('#users > summary').click();
  assert.equal(await page.locator('#users').evaluate(el=>el.open),true);
  await page.evaluate(()=>{
   window.dispatchEvent(new Event('stainher:modules-ready'));
   const div=document.createElement('p');div.textContent='New information';document.querySelector('#page-liderazgo').appendChild(div);
  });
  await page.waitForTimeout(550);
  assert.equal(await page.locator('#users').evaluate(el=>el.open),true,'manual expansion preserved after re-render');
  assert.equal(await page.locator('#history').evaluate(el=>el.open),false,'unopened history remains collapsed');
  // Real RIT bootstrap mounts a hidden staging container before its modal loads.
  await page.addScriptTag({content:rit});
  await page.waitForTimeout(30);
  assert.equal(await page.locator('#rit-r331').count(),1);
  assert.equal(await page.locator('#stainher-rit-stage-r391 #rit-r331').count(),1,'RIT created in hidden stage');
  assert.equal(await page.locator('#rit-r331').isVisible(),false,'legacy RIT never flashes in page');
  await page.addScriptTag({content:modal});
  await page.evaluate(()=>window.StainherRITModalR390.mount());
  assert.equal(await page.locator('#rit-r331').count(),1,'single RIT form');
  assert.equal(await page.locator('#stainher-rit-overlay-r390 #rit-r331').count(),1,'RIT moved to modal');
  assert.equal(await page.locator('#rit-r331').isVisible(),false,'RIT invisible while dialog closed');
  assert.equal(await page.locator('#stainher-rit-overlay-r390 .r390-loading').count(),0,'no stale loading banner');
  const card=page.locator('#stainher-rit-card-r389');
  await card.locator('[data-r390-action="open"]').click();
  assert.equal(await page.locator('#rit-r331').isVisible(),true,'RIT only visible by explicit action');
  assert.equal(await page.locator('#users').evaluate(el=>el.open),true,'opening RIT does not modify disclosures');
  await page.locator('#stainher-rit-overlay-r390 [data-r390-close]').click();
  assert.equal(await page.locator('#rit-r331').isVisible(),false);
  assert.equal(await page.locator('#rit-r331').count(),1);
  await page.close();
 }
}finally{await browser.close()}
console.log('R391: no initial RIT flash, report sections collapsed, manual panel state preserved in iPhone/desktop');
