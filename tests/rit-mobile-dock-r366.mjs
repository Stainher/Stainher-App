import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const source=fs.readFileSync('assets/stainher-v1524-rit-mobile-access-r366.js','utf8');
const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(source);new Function(loader);
assert.match(loader,/await refreshRITMobileR366\(\)/);
assert.match(loader,/stainher-v1524-rit-mobile-access-r366\.js/);
assert.match(source,/safe-area-inset-bottom/);
assert.doesNotMatch(source,/MutationObserver|setInterval|setTimeout|innerHTML\s*=/);
const browser=await chromium.launch({headless:true});
try {
 for(const theme of ['light','modern','dark']){
  for(const [width,height] of [[390,844],[320,610]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
   await page.setContent(
    '<!doctype html><html data-theme="'+theme+'"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<style>body{margin:0;font-family:Arial}#page-liderazgo{padding:10px;box-sizing:border-box}'+
    '.rit331{margin:10px 0 100px;padding:12px;border:1px solid #aaa}.rt-box{height:740px}'+
    '#v151MobileBottom{position:fixed;z-index:500;bottom:8px;left:6px;right:6px;height:86px;background:#132238;border-radius:13px}'+
    '</style></head><body><main id="app"><section id="page-liderazgo"><h1>Liderazgo en Terreno</h1>'+
    '<section class="rit331" id="rit-r331"><div class="rt-bar"><h3>Reunión de Inicio de Turno (RIT)</h3>'+
    '<div class="rt-row"><button data-act="new">Nuevo RIT</button><button data-act="history">Historial</button></div></div>'+
    '<div class="rt-box">Etapa 1 · Datos generales</div>'+
    '<div class="rt-bar"><button data-act="previous">Anterior</button><span id="rt-message"></span><div class="rt-row">'+
    '<button data-act="save">Guardar borrador</button><button data-act="next">Siguiente</button></div></div></section></section>'+
    '</main><nav id="v151MobileBottom"><button>Inicio</button><button>Preventivo</button></nav></body></html>'
   );
   await page.addScriptTag({content:source});
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   const metrics=await page.evaluate(()=>{
     const last=document.querySelector('#rit-r331 .rt-bar:last-child');
     const dock=document.getElementById('v151MobileBottom');
     const button=last.querySelector('[data-act="next"]');
     const rect=button.getBoundingClientRect(),bar=dock.getBoundingClientRect();
     return {buttonTop:rect.top,buttonBottom:rect.bottom,dockTop:bar.top,
       minHeight:getComputedStyle(button).minHeight,
       overlap:Math.max(0,rect.bottom-bar.top),
       pagePadding:getComputedStyle(document.getElementById('page-liderazgo')).paddingBottom};
   });
   assert.ok(metrics.dockTop-metrics.buttonBottom>=8,
     theme+' '+width+'px last RIT action under navigation: '+JSON.stringify(metrics));
   assert.ok(Number.parseFloat(metrics.minHeight)>=44,theme+' action too small');
   const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(scrollWidth<=width+1,'RIT horizontal overflow '+width+' '+scrollWidth);
   await page.close();
  }
 }
}finally{await browser.close()}
console.log('R366: RIT mobile actions clear of fixed dock in light/modern/dark and 320/390px');
