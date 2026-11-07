import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const code=readFileSync('assets/stainher-v1524-date-picker.js','utf8');
const browser=await chromium.launch({headless:true});
try{
 for(const theme of ['light','modern','dark']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent(`<html data-theme="${theme}"><body><section class="page" id="page-preventivo"><label>Mes contractual<input type="month" id="v1523PrevEdpMonth" value="2026-11" onchange="window.selectedMonth=this.value"></label></section></body></html>`);
  await page.addScriptTag({content:code});
  await page.addScriptTag({content:code});
  const month=page.getByRole('combobox',{name:'Mes contractual',exact:true});
  assert.equal(await month.isVisible(),true);
  assert.equal(await month.locator('option:checked').textContent(),'Noviembre 2026');
  await month.selectOption('12');assert.equal(await page.evaluate(()=>window.selectedMonth),'2026-12');
  await page.getByRole('spinbutton',{name:'Año contractual',exact:true}).fill('2027');
  await page.getByRole('spinbutton',{name:'Año contractual',exact:true}).press('Tab');
  assert.equal(await page.evaluate(()=>window.selectedMonth),'2027-12');
  assert.equal(await month.locator('option:checked').textContent(),'Diciembre 2027');
  await page.evaluate(()=>v1514InstallDatePickers(document));
  assert.equal(await page.locator('[data-contractual-selector]').count(),1);
  assert.equal(await month.evaluate(n=>getComputedStyle(n).webkitTextFillColor),'rgb(23, 52, 77)');
  assert.equal(await page.locator('[data-contractual-selector]').evaluate(n=>n.getBoundingClientRect().right<=innerWidth),true);
  await page.close();
 }
 console.log('PASS: contractual month visible in three themes, month/year changes preserve original handler, no duplicate or overflow.');
}finally{await browser.close()}
