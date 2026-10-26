import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('assets/stainher-v1524-theme.js','utf8');
const start=source.indexOf('  /* R290: the direct-turns renderer');
const end=source.indexOf("  const modules=['stainher-v1524-collapsible.js'",start);
assert.ok(start>0&&end>start);
const code=source.slice(start,end);
const browser=await chromium.launch({headless:true});
try{
for(const allowed of [true,false]){
  const page=await browser.newPage();
  await page.setContent('<html><body><section id="page-turnos"><div class="topbar"><div class="actions"><button onclick="v1520TurnReport()">↓ Informe</button><button>↻ Actualizar vista</button></div></div></section></body></html>');
  await page.addScriptTag({content:`window.isAdmin=()=>${allowed};window.v1520CanEdit=()=>${allowed};window.v1512PublishTurnMonth=()=>window.publishClicks=(window.publishClicks||0)+1;`});
  await page.addScriptTag({content:code});
  await page.waitForTimeout(80);
  let count=await page.locator('[data-r290-publish]').count();
  assert.equal(count,allowed?1:0,'Permission gate '+allowed);
  if(allowed){
    await page.locator('[data-r290-publish]').click();
    assert.equal(await page.evaluate(()=>window.publishClicks),1);
    await page.evaluate(()=>document.querySelector('.topbar').innerHTML='<div class="actions"><button>+ Nuevo evento</button><button>↓ Informe</button></div>');
    await page.waitForTimeout(90);
    assert.equal(await page.locator('[data-r290-publish]').count(),1,'Restore after direct renderer rerenders toolbar');
  }
  await page.close();
}
}finally{await browser.close()}
console.log('R290: visible administrator publish button, rerender recovery and click action verified');