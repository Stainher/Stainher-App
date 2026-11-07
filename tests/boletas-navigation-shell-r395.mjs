import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const nav=readFileSync('assets/stainher-v1524-navigation-stability.js','utf8');
const theme=readFileSync('assets/stainher-v1524-theme.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(nav);
assert.match(theme,/20261107-r396-boletas-drawer-unlock/,'R396 navigation cache freshness');
assert.ok(Number(loader.match(/__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1])>=395,'R395+');
assert.match(nav,/function synchronizeBoletasHeader/);
assert.match(nav,/closeDrawerForBoletas/);
const browser=await chromium.launch({headless:true});
try{
 for(const viewport of [390,1200]){
  const page=await browser.newPage({viewport:{width:viewport,height:800},isMobile:viewport===390,hasTouch:viewport===390});
  await page.setContent('<!doctype html><html><head><title>Stainher App V15.24 R319</title><meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<style>.page.hidden,.page[hidden]{display:none!important}'+
   '#v151DrawerOverlay{display:none}#v151DrawerOverlay.v151-open{display:block}'+
   '.sidebar{position:fixed;left:0;top:0;bottom:0;width:230px;background:#101b28}'+
   '.sidebar:not(.v151-open){display:none}</style></head><body>'+
   '<div id="appView"><aside class="sidebar v151-open"><nav class="nav">'+
    '<button data-page="solicitudes" class="active">Solicitudes</button>'+
    '<button data-page="boletas-rendir">🧾 Boletas a rendir</button>'+
    '<button data-page="liderazgo">Liderazgo en Terreno</button>'+
   '</nav></aside><main class="main">'+
   '<header id="v1514GlobalHeader" class="v1514-global-head"><div><h2>Solicitudes</h2>'+
   '<p>Registra y realiza seguimiento a solicitudes operacionales</p>'+
   '<div class="v1514-global-meta"><span>Stainher App · V15.24 · R319</span></div></div>'+
   '<div class="v1516-header-actions"><button>+ Nueva solicitud</button></div></header>'+
   '<section class="page" id="page-solicitudes"><h3>Solicitudes</h3></section>'+
   '<section class="page hidden" id="page-boletas-rendir" hidden aria-hidden="true"><h2 class="r354-head">Boletas a rendir</h2>'+
   '<p>Rendición independiente</p><button>+ Nueva boleta</button></section>'+
   '<section class="page hidden" id="page-liderazgo" hidden aria-hidden="true">Liderazgo</section>'+
   '</main></div><div id="v151DrawerOverlay" class="v151-open"></div>'+
   '<header id="v151MobileHead"><div class="v151-mobile-title"><strong id="v151MobileTitle">📋 Solicitudes</strong><small>Stainher App · V15.24 · R319</small></div></header>'+
   '<div id="v151MobileBottom"><button data-v151-page="solicitudes">Solicitudes</button><button data-v151-page="liderazgo">Liderazgo</button></div></body></html>');
  await page.evaluate(()=>{
   window.__renderBoletas=0;window.__navigateOthers=0;
   window.v1519Navigate=async name=>{
    window.__navigateOthers++;
    const h=document.getElementById('v1514GlobalHeader');
    h.querySelector('h2').textContent=name==='solicitudes'?'Solicitudes':'Liderazgo en Terreno';
    h.querySelector('p').textContent='Descripción de '+name;
    document.getElementById('v151MobileTitle').textContent=name==='solicitudes'?'📋 Solicitudes':'🧰 Liderazgo en Terreno';
    return true;
   };
   window.StainherBoletasR354={install(){},render:async()=>{window.__renderBoletas++;}};
  });
  await page.addScriptTag({content:nav});
  await page.locator('.nav button[data-page="boletas-rendir"]').click();
  await page.waitForFunction(()=>document.getElementById('v1514GlobalHeader').querySelector('h2')?.textContent==='Boletas a rendir'&&document.getElementById('page-boletas-rendir').hidden===false);
  assert.equal(await page.locator('.sidebar').evaluate(x=>x.classList.contains('v151-open')),false,'drawer closes immediately');
  assert.equal(await page.locator('#v151DrawerOverlay').evaluate(x=>x.classList.contains('v151-open')),false,'overlay closes');
  assert.equal(await page.evaluate(()=>document.body.classList.contains('v151-drawer-open')),false);
  assert.equal(await page.locator('#v151MobileTitle').innerText(),'🧾 Boletas a rendir','mobile title matches boletas');
  assert.equal(await page.locator('#v1514GlobalHeader h2').innerText(),'Boletas a rendir');
  assert.equal(await page.locator('#v1514GlobalHeader .v1516-header-actions').isVisible(),false,'Solicitudes header actions temporarily hidden');
  assert.equal(await page.locator('#page-solicitudes').isVisible(),false,'requests hidden');
  assert.equal(await page.locator('#page-boletas-rendir').isVisible(),true,'boletas visible');
  assert.equal(await page.locator('#page-boletas-rendir .r354-head').isVisible(),false,'no duplicate title');
  assert.equal(await page.locator('#page-boletas-rendir button').isVisible(),true,'boletas actions preserved');
  assert.equal(await page.evaluate(()=>window.__renderBoletas),1,'render correct module once');
  // R396: abrir el menú de forma manual no debe ser revertido por el
  // normalizador que observa cambios en el DOM.
  await page.evaluate(()=>{
    document.querySelector('.sidebar').classList.add('v151-open');
    document.querySelector('#v151DrawerOverlay').classList.add('v151-open');
    const child=document.createElement('span');child.textContent='navegación abierta';
    document.querySelector('.sidebar').appendChild(child);
  });
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.sidebar').evaluate(x=>x.classList.contains('v151-open')),true,'drawer can reopen while in Boletas');
  assert.equal(await page.locator('#v151DrawerOverlay').evaluate(x=>x.classList.contains('v151-open')),true,'overlay remains open until explicitly closed');
  await page.evaluate(()=>{document.querySelector('#v1514GlobalHeader h2').textContent='Solicitudes';});
  await page.waitForFunction(()=>document.querySelector('#v1514GlobalHeader h2').textContent==='Boletas a rendir');
  await page.evaluate(()=>window.v1519Navigate('solicitudes'));
  await page.waitForFunction(()=>document.getElementById('page-solicitudes').hidden===false);
  assert.equal(await page.locator('#page-boletas-rendir').isVisible(),false,'boletas hidden after leaving');
  assert.equal(await page.locator('#page-solicitudes').isVisible(),true,'requests visible');
  assert.equal(await page.locator('#page-boletas-rendir .r354-head').isVisible(),false,'hidden route stays hidden');
  assert.equal(await page.locator('#v1514GlobalHeader h2').innerText(),'Solicitudes','header resets');
  assert.equal(await page.locator('#v1514GlobalHeader .v1516-header-actions').isVisible(),true,'original header action restored');
  assert.match((await page.locator('#v151MobileTitle').innerText()).replace(/\s+/g,''),/^📋Solicitudes$/,'mobile title resets');
  await page.close();
 }
}finally{await browser.close()}
console.log('R395: menú móvil se cierra, cabeceras cambian, Boletas y Solicitudes no se superponen.');
