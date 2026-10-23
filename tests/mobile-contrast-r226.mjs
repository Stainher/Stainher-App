import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';
const source=readFileSync('assets/stainher-v1524-theme.js','utf8');
const css=source.match(/const css=`([\s\S]*?)`;/)?.[1];
assert.ok(css,'No se encontró CSS de tema');
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern']){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html data-theme="${theme}"><head><style>
    html[data-theme="light"] body #v151MobileHead .v151-mobile-title strong,
    html[data-theme="light"] body #v151MobileHead .v151-mobile-title small{color:#0c2a42!important}
    html[data-theme="light"] body #v151MobileBottom button{color:#102030!important}
    #v151MobileHead,#v151MobileBottom{background:#111b25!important}
  </style></head><body>
    <div id="v151MobileHead" class="v151-mobile-head"><div class="v151-mobile-title"><strong>Inicio</strong><small>Stainher App · V15.24 R226</small></div></div>
    <div id="v151MobileBottom" class="v151-mobile-bottom">
      <button class="active" aria-current="page"><b>⌂</b><span>Inicio</span></button>
      <button><b>✓</b><span>Preventivo</span></button>
      <button><b>⚙</b><span>Correctivo</span></button>
      <button><b>☰</b><span>Más</span></button>
    </div>
  </body></html>`);
  await page.addStyleTag({content:css});
  const selectors=['#v151MobileHead strong','#v151MobileHead small',
    '#v151MobileBottom button.active span','#v151MobileBottom button:not(.active) span',
    '#v151MobileBottom button:not(.active) b'];
  for(const sel of selectors){
    const color=await page.locator(sel).first().evaluate(n=>getComputedStyle(n).color);
    const rgb=(color.match(/\d+/g)||[]).slice(0,3).map(Number);
    assert.equal(rgb.length,3,sel+' = '+color);
    assert.ok(rgb.every(x=>x>=200),theme+' '+sel+' must remain legible, got '+color);
  }
  await page.screenshot({path:`artifacts/mobile-navigation-${theme}-r226.png`});
  console.log('PASS mobile nav contrast '+theme);
  await page.close();
 }
} finally {await browser.close()}
