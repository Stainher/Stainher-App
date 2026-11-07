import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const src=readFileSync('assets/stainher-v1524-boletas-rendir-r354.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(src);new Function(loader);
assert.ok(Number(loader.match(/__STAINHER_HP_LOADER_VERSION__='R(\d+)'/)?.[1])>=392,'R392 se conserva en versiones posteriores');
assert.match(src,/function markLegacySlugTitle/);
assert.match(src,/data-r392-boletas-slug-title/);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1200]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
   '<body><nav class="nav"><button data-page="boletas-rendir">Boletas a rendir</button></nav>'+
   '<main><header><h1 id="shell-title">boletas-rendir</h1><p id="badge">Stainher App · V15.24</p></header>'+
   '<section id="page-solicitudes" class="page"></section></main></body></html>');
  await page.evaluate(()=>{window.state={session:{user:{id:'test-123'}}};window.sb={};});
  await page.addScriptTag({content:src});
  await page.evaluate(()=>{
   const root=document.getElementById('page-boletas-rendir');
   root.hidden=false;root.classList.remove('hidden');root.setAttribute('aria-hidden','false');
   root.innerHTML='<h2 class="r354-head">Boletas a rendir</h2><div class="r354-actions"><button>+ Nueva boleta</button></div>'+
    '<div class="r354-grid"><div>Total rendido $0</div><div>Pendiente de reintegro $0</div></div>';
  });
  await page.locator('[data-page="boletas-rendir"]').click();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#shell-title')).display==='none');
  assert.equal(await page.locator('.r354-head').isVisible(),true,'correct module title remains');
  assert.equal(await page.locator('#badge').isVisible(),true,'version badge remains');
  assert.equal(await page.getByText('Total rendido $0').isVisible(),true,'KPI remains');
  assert.equal(await page.getByText('Pendiente de reintegro $0').isVisible(),true,'pending KPI remains');
  await page.evaluate(()=>{
    const root=document.getElementById('page-boletas-rendir');
    root.classList.add('hidden');root.hidden=true;root.setAttribute('aria-hidden','true');
    document.querySelector('#shell-title').textContent='Solicitudes';
  });
  assert.equal(await page.locator('#shell-title').isVisible(),true,'the shared title remains visible in other modules');
  await page.close();
 }
}finally{await browser.close()}
console.log('R392: solo se oculta boletas-rendir duplicado; título, KPIs y navegación conservados.');
