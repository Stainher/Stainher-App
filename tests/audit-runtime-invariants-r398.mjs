import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<html><head><title>Stainher App V15.24 R398</title></head><body><section class="page" id="page-inicio"><div><span id="version">Stainher App · V15.24 · R397</span></div><div><label><span id="date">07-11-2026</span><input type="date" value="2026-11-07"></label></div></section></body></html>');
 await page.addScriptTag({content:readFileSync('assets/stainher-v1524-navigation-stability.js','utf8')});
 assert.equal(await page.locator('#version').getAttribute('class'),'stainher-brand-chip-r206');
 assert.equal(await page.locator('#date').getAttribute('class'),null,'La fecha del formulario no es una insignia de cabecera');
 assert.equal(await page.locator('label').getAttribute('class'),null);
 assert.equal(await page.locator('input').inputValue(),'2026-11-07');
 await page.close();
 console.log('R398: metadatos de versión normalizados sin alterar fechas ni formularios.');
}finally{await browser.close()}
