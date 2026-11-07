import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('assets/stainher-v1524-rit-control-card-r389.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
const rit=readFileSync('assets/stainher-v1524-rit-r331.js','utf8');
new Function(source);new Function(loader);
assert.match(loader,/await refreshRITCardR389\(\)/);
assert.match(loader,/stainher-v1524-rit-control-card-r389\.js/);
assert.doesNotMatch(source,/new\s+MutationObserver|setInterval/);
assert.match(rit,/record\.actividades\.length>=6/);
assert.match(rit,/exportPDF\(\)/);
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  for(const width of [390,1200]){
   const page=await browser.newPage({viewport:{width,height:840},isMobile:width===390,hasTouch:width===390});
   await page.setContent('<!DOCTYPE html><html data-theme="'+theme+'"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+
    'body{margin:0;background:#e8f1fa;color:#17354d;font:15px Arial}'+
    '#page-liderazgo{padding:12px;max-width:100%;box-sizing:border-box}'+
    '.v1512-control-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:10px}'+
    '.control-card-v95{padding:12px;border:1px solid #aac7d9;border-radius:12px}'+
    '.rit331{padding:12px}'+
    '</style></head><body><section id="page-liderazgo">'+
    '<section id="v1512Lead_controles"><h3>Controles Stainher</h3>'+
    '<div class="v1512-control-grid"><article class="control-card-v95"><h4>4</h4><p>Check List de Camioneta</p><button>Realizar ahora</button></article>'+
    '<article class="control-card-v95"><h4>5</h4><p>Check List de Extintores</p><button>Realizar ahora</button></article></div></section>'+
    '<section class="rit331" id="rit-r331"><div class="rt-bar"><h3>Reunión de Inicio de Turno (RIT)</h3>'+
    '<button data-act="new">Nuevo RIT</button><button data-act="history">Historial</button></div>'+
    '<div class="rt-box"><label>Centro de trabajo<input id="rt-centro" value="Codelco Andina"></label><p>Etapa 1 de 6</p></div>'+
    '</section></section></body></html>');
   await page.evaluate(()=>{
    window.state={session:{user:{id:'test-logged-in'}}};
    window.__ritHistoryCalls=0;
    document.getElementById('page-liderazgo').addEventListener('click',e=>{
     if(e.target.matches?.('#rit-r331 [data-act="history"]'))window.__ritHistoryCalls++;
    });
    window.StainherRIT={mount(){}};
   });
   await page.addScriptTag({content:source});
   await page.evaluate(()=>window.StainherRITCardR389.mount());
   const card=page.locator('#stainher-rit-card-r389');
   assert.equal(await card.count(),1);
   assert.equal(await page.locator('#rit-r331').count(),1);
   assert.equal(await page.locator('#page-liderazgo > #rit-r331').count(),0,'no standalone RIT');
   assert.equal(await page.locator('#v1512Lead_controles .v1512-control-grid > #stainher-rit-card-r389').count(),1);
   assert.equal(await page.locator('#stainher-rit-control-body-r389').evaluate(el=>el.hidden),true);
   await card.locator('[data-r389-action="toggle"]').click();
   assert.equal(await page.locator('#stainher-rit-control-body-r389').evaluate(el=>el.hidden),false);
   assert.equal(await card.locator('[data-r389-action="toggle"]').getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#rt-centro').inputValue(),'Codelco Andina');
   await card.locator('[data-r389-action="history"]').click();
   assert.equal(await page.evaluate(()=>window.__ritHistoryCalls),1,'history delegated exactly once');
   await card.locator('[data-r389-action="toggle"]').click();
   assert.equal(await page.locator('#stainher-rit-control-body-r389').evaluate(el=>el.hidden),true);
   assert.equal(await page.locator('#rt-centro').inputValue(),'Codelco Andina','draft retained');
   await page.evaluate(()=>window.StainherRITCardR389.mount());
   assert.equal(await card.count(),1,'no duplicated card');
   assert.equal(await page.locator('#rit-r331').count(),1,'no duplicated wizard');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,theme+' '+width+' overflow');
   await page.close();
  }
 }
}finally{await browser.close()}
console.log('R389: RIT card, responsive, history, draft preserved');
