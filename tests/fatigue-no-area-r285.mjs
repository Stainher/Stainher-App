import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const theme=readFileSync('assets/stainher-v1524-theme.js','utf8');
const start=theme.indexOf('  /* R285: Fatiga');
const end=theme.indexOf("  const modules=['stainher-v1524-collapsible.js'",start);
assert.ok(start>=0&&end>start,'R285 fatigue logic');
const js=theme.slice(start,end);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.setContent('<html><body><div id="modalRoot"><div class="modal"><h3>FATIGA Y SOMNOLENCIA STAINHER</h3><form><label>Fecha<input type="date" name="fecha"></label><label>Área / Equipo<input name="area" value=""></label><label>Conductor<input name="conductor"></label></form></div></div></body></html>');
 await page.addScriptTag({content:js});
 await page.waitForFunction(()=>!document.querySelector('#modalRoot label input[name="area"]'));
 const result=await page.evaluate(()=>({labels:[...document.querySelectorAll('#modalRoot label')].map(l=>l.textContent.trim()),hidden:document.querySelector('#modalRoot input[name="area"]')?.type}));
 assert.deepEqual(result.labels,['Fecha','Conductor']);
 assert.equal(result.hidden,'hidden');
 await page.evaluate(()=>document.getElementById('modalRoot').innerHTML='<div class="modal"><h3>Cartilla de Inspección Ambiental</h3><label>Área / Equipo<input name="area"></label></div>');
 await page.waitForTimeout(50);
 assert.equal(await page.locator('#modalRoot label input[name="area"]').count(),1,'Other controls remain unchanged');
 await page.close();
}finally{await browser.close()}
console.log('R285: fatigue field removed; other control preserved');
