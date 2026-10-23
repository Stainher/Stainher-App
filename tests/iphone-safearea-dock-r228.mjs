import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const read=path=>readFileSync(path,'utf8');
const theme=read('assets/stainher-v1524-theme.js');
const css=theme.match(/const css=`([\s\S]*?)`;/)?.[1];
const html=read('index.html');
const inlineDock=html.match(/<style id="v1523-mobile-grid-bottom-fix">([\s\S]*?)<\/style>/)?.[1];
assert.ok(css,'CSS de tema real');
assert.ok(inlineDock,'La regla heredada exacta del dock debe existir en index');
assert.match(inlineDock,/bottom:0!important/,'Se reproduce el conflicto histórico real');
assert.match(css,/--stainher-mobile-safe-bottom/,'Debe utilizar la zona segura de iOS');

mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const skin of ['light','modern']){
   const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
   await page.setContent(`<!doctype html><html data-theme="${skin}" style="--stainher-mobile-safe-bottom:34px"><head><style>
     html body #v151MobileBottom{height:180px!important;min-height:180px!important;padding:45px 6px!important;background:#101a24!important}
   </style></head><body style="margin:0;background:#d4e5f0;min-height:100vh">
    <div id="v151MobileHead" class="v151-mobile-head"><div class="v151-mobile-title"><strong>Turnos y Novedades</strong><small>Stainher App · V15.24 · R228</small></div></div>
    <nav id="v151MobileBottom" class="v151-mobile-bottom">
     <button class="active" aria-current="page"><b>⌂</b><span>Inicio</span></button>
     <button><b>✓</b><span>Preventivo</span></button>
     <button><b>⚙</b><span>Correctivo</span></button>
     <button><b>✎</b><span>Solicitudes</span></button>
     <button><b>☰</b><span>Más</span></button>
    </nav>
   </body></html>`);
   await page.addStyleTag({content:inlineDock});
   await page.addStyleTag({content:css});
   const result=await page.locator('#v151MobileBottom').evaluate(nav=>{
     const r=nav.getBoundingClientRect(),st=getComputedStyle(nav),buttons=[...nav.querySelectorAll('button')];
     return {height:r.height,bottom:parseFloat(st.bottom),viewport:innerHeight,visibleBottom:r.bottom,
       bottomPadding:parseFloat(st.paddingBottom),bg:st.backgroundColor,
       buttonHeights:buttons.map(b=>b.getBoundingClientRect().height),
       buttonColors:buttons.map(b=>getComputedStyle(b).color),
       labelColors:buttons.map(b=>getComputedStyle(b.querySelector('span')).color),
       width:r.width,right:r.right};
   });
   assert.ok(result.bottom>=15&&result.bottom<=17,skin+' dock lowered to 16px from bottom with 34px inset: '+JSON.stringify(result));
   assert.ok(result.height>=54&&result.height<=70,skin+' dock must not paint the entire safe-area: '+JSON.stringify(result));
   assert.ok(result.bottomPadding<=6,skin+' iOS inset must not be inside dark dock');
   assert.ok(result.buttonHeights.every(h=>h>=48&&h<=49),skin+' touch targets');
   assert.ok(result.labelColors.every(v=>{const a=(v.match(/\d+/g)||[]).slice(0,3).map(Number);return a.length===3&&a.every(n=>n>=200)}),skin+' navigation legibility');
   assert.ok(result.width<390&&result.right<390,skin+' floating horizontal margins');
   const lowerViewport=await page.evaluate(()=>{document.documentElement.style.setProperty('--stainher-mobile-safe-bottom','0px');const d=document.querySelector('#v151MobileBottom');return {bottom:parseFloat(getComputedStyle(d).bottom),height:d.getBoundingClientRect().height}});
   assert.ok(lowerViewport.bottom>=7&&lowerViewport.bottom<=9,skin+' 8px minimum if no notch');
   assert.ok(lowerViewport.height>=54&&lowerViewport.height<=70,skin+' stable height without notch');
   await page.evaluate(()=>document.documentElement.style.setProperty('--stainher-mobile-safe-bottom','34px'));
   await page.screenshot({path:`artifacts/iphone-safearea-dock-${skin}-r228.png`,fullPage:true});
   console.log('PASS R228 iOS safe-area dock: '+skin,JSON.stringify(result));
   await page.close();
 }
}finally{await browser.close()}
