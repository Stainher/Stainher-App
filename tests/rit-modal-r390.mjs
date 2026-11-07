import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const modal=readFileSync('assets/stainher-v1524-rit-control-modal-r390.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const rit=readFileSync('assets/stainher-v1524-rit-r331.js','utf8');
new Function(modal);new Function(rit);new Function(loader);
assert.match(loader,/await refreshRITModalR390\(\)/);
assert.match(loader,/stainher-v1524-rit-control-modal-r390\.js/);
assert.doesNotMatch(loader,/await refreshRITCardR389\(\)/);
assert.doesNotMatch(modal,/new\s+MutationObserver\s*\(|setInterval\s*\(/);
assert.match(modal,/role="dialog"/);
assert.match(rit,/data-act="finish"|case "finish"/);
assert.match(rit,/StainherRITPDF/);

const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  for(const width of [390,1200]){
   const p=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
   await p.setContent('<!DOCTYPE html><html data-theme="'+theme+'"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+
     'body{margin:0;font:15px Arial;background:#dceaf4}'+
     '#page-liderazgo{padding:12px;box-sizing:border-box;max-width:100%}'+
     '.v1512-control-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}'+
     '.control-card-v95{padding:12px;border:1px solid #aac7d9;border-radius:12px}'+
     '#v151MobileBottom{position:fixed;z-index:100000;bottom:0;left:0;right:0;height:85px;background:#14283a}'+
     '</style></head><body><section id="page-liderazgo"><section id="v1512Lead_controles"><h3>Controles Stainher</h3>'+
     '<div class="v1512-control-grid"><article class="control-card-v95"><h4>Check List de Camioneta</h4><button>Realizar ahora</button></article>'+
     '<article class="control-card-v95"><h4>Check List de Extintores</h4><button>Realizar ahora</button></article></div></section>'+
     '<section class="rit331" id="rit-r331"><div class="rt-bar"><h3>Reunión de Inicio de Turno (RIT)</h3>'+
     '<button data-act="new">Nuevo RIT</button><button data-act="history">Historial</button></div>'+
     '<div class="rt-box"><label>Centro de trabajo<input id="rt-centro" value="Codelco Andina"></label>'+
     '<div style="height:1100px">Etapa 1 de 6</div><button data-act="next">Siguiente</button></div></section>'+
     '</section><nav id="v151MobileBottom">Navegación inferior</nav></body></html>');
   await p.evaluate(()=>{
     window.state={session:{user:{id:'test'}}};
     window.StainherRIT={mount(){}};
     window.__historyClicks=0;window.__nextClicks=0;
     document.getElementById('page-liderazgo').addEventListener('click',event=>{
       if(event.target.matches?.('#rit-r331 [data-act="history"]'))window.__historyClicks++;
       if(event.target.matches?.('#rit-r331 [data-act="next"]'))window.__nextClicks++;
     });
   });
   await p.addScriptTag({content:modal});
   await p.evaluate(()=>window.StainherRITModalR390.mount());
   const card=p.locator('#stainher-rit-card-r389');
   const overlay=p.locator('#stainher-rit-overlay-r390');
   const dialog=overlay.getByRole('dialog');
   assert.equal(await card.count(),1);
   assert.equal(await p.locator('#rit-r331').count(),1);
   assert.equal(await overlay.evaluate(n=>n.hidden),true,'closed by default');
   assert.equal(await p.locator('#page-liderazgo > #rit-r331').count(),0,'no standalone RIT form');
   assert.equal(await p.locator('#v1512Lead_controles .v1512-control-grid > #stainher-rit-card-r389').count(),1);
   await card.locator('[data-r390-action="open"]').click();
   assert.equal(await overlay.evaluate(n=>n.hidden),false,'modal opened');
   assert.equal(await dialog.getAttribute('aria-modal'),'true');
   assert.equal(await dialog.isVisible(),true);
   assert.equal(await p.locator('#rit-r331 > .rt-bar:first-child').isVisible(),false,'no duplicate title/actions inside form');
   const geom=await dialog.boundingBox();
   assert.ok(geom.width<=width+1&&geom.x>=-1&&geom.y>=-1&&geom.height<=844,'modal fits viewport '+theme+' '+width+' '+JSON.stringify(geom));
   assert.ok(await overlay.evaluate(node=>Number.parseInt(getComputedStyle(node).zIndex)>100000),'above mobile dock');
   await p.locator('#rt-centro').fill('Codelco Andina - revisión');
   const scroller=overlay.locator('#stainher-rit-modal-body-r390');
   await scroller.evaluate(el=>{el.scrollTop=el.scrollHeight});
   assert.ok(await scroller.evaluate(el=>el.scrollTop>0),'scrollable long wizard');
   await p.locator('#rit-r331 [data-act="next"]').click();
   assert.equal(await p.evaluate(()=>window.__nextClicks),1,'RIT button event still bubbles through page');
   await overlay.locator('[data-r390-close]').click();
   assert.equal(await overlay.evaluate(node=>node.hidden),true);
   assert.equal(await p.evaluate(()=>document.body.style.overflow),'','background unlocked');
   await card.locator('[data-r390-action="open"]').click();
   assert.equal(await p.locator('#rt-centro').inputValue(),'Codelco Andina - revisión','preserve draft on reopen');
   await overlay.locator('[data-r390-close]').click();
   await card.locator('[data-r390-action="history"]').click();
   assert.equal(await p.evaluate(()=>window.__historyClicks),1,'history delegated once');
   assert.equal(await overlay.evaluate(node=>node.hidden),false,'history inside modal');
   await p.keyboard.press('Escape');
   assert.equal(await overlay.evaluate(node=>node.hidden),true,'escape closes');
   await p.evaluate(()=>window.StainherRITModalR390.mount());
   assert.equal(await p.locator('#rit-r331').count(),1,'no duplicated RIT after rerender');
   assert.equal(await card.count(),1,'no duplicated card after rerender');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no horizontal overflow');
   await p.close();
  }
 }
}finally{await browser.close()}
console.log('R390: RIT modal, single original wizard, background lock, mobile scroll, history and PDF retained');
