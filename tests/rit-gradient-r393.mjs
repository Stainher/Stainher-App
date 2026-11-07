import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const js=readFileSync('assets/stainher-v1524-rit-control-modal-r390.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(js);
assert.ok(Number(loader.match(/__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1])>=393,'R393 mantiene su diseño en revisiones posteriores');
assert.match(js,/linear-gradient\(135deg,#f36b21 0%,#e85a0c 55%,#c9470a 100%\)/);
assert.match(js,/#ffffff!important/);
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  for(const width of [390,1200]){
   const p=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
   await p.setContent('<!doctype html><html data-theme="'+theme+'"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+
    'body{margin:0;background:#ecf3fa;font:15px Arial}#page-liderazgo{padding:12px;max-width:100%;box-sizing:border-box}'+
    '.v1512-control-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}'+
    '.control-card-v95{background:rgb(245,249,253);padding:12px;border-radius:10px}'+
    '</style></head><body><section id="page-liderazgo"><section id="v1512Lead_controles"><h3>Controles Stainher</h3>'+
    '<div class="v1512-control-grid"><article id="other-control" class="control-card-v95"><h4>Check List de Camioneta</h4><button>Realizar ahora</button></article></div>'+
    '</section></section></body></html>');
   await p.evaluate(()=>{window.state={session:{user:{id:'test'}}};window.StainherRIT={mount(){}};});
   await p.addScriptTag({content:js});
   await p.evaluate(()=>window.StainherRITModalR390.mount());
   const card=p.locator('#stainher-rit-card-r389');
   assert.equal(await card.count(),1);
   const bg=await card.evaluate(n=>getComputedStyle(n).backgroundImage);
   assert.match(bg,/linear-gradient\(135deg/);
   assert.match(bg,/243, 107, 33/);
   assert.match(bg,/201, 71, 10/);
   const title=await card.locator('h4').evaluate(n=>getComputedStyle(n).color);
   assert.equal(title,'rgb(255, 255, 255)');
   const another=await p.locator('#other-control').evaluate(n=>getComputedStyle(n).backgroundImage);
   assert.equal(another,'none','other cards unchanged');
   await card.locator('[data-r390-action="open"]').click();
   const dialog=p.locator('#stainher-rit-overlay-r390 .r390-dialog');
   assert.equal(await dialog.isVisible(),true);
   const modalBackground=await dialog.evaluate(n=>getComputedStyle(n).backgroundImage);
   assert.equal(modalBackground,'none','RIT modal remains original style');
   await p.locator('#stainher-rit-overlay-r390 [data-r390-close]').click();
   assert.equal(await dialog.isVisible(),false);
   await p.close();
  }
 }
}finally{await browser.close()}
console.log('R393: orange gradient exclusive to RIT card; modal and other controls unchanged.');
