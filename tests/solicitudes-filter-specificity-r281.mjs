import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const request=readFileSync('assets/stainher-v1524-request-close-r177.js','utf8');
const compact=readFileSync('assets/stainher-v1524-solicitudes-view-r133.js','utf8');
const reqCSS=request.split("style.textContent=\x60")[1]?.split("\x60;")[0];
const compactCSS=compact.split("style.textContent=\x60")[1]?.split("\x60;")[0];
assert.ok(reqCSS&&compactCSS);
const normalize=s=>s.replaceAll('${PAGE_ID}','page-solicitudes').replaceAll('${TOOLBAR}','stainher-solicitudes-view-toolbar-r133');
const browser=await chromium.launch({headless:true});
try{
for(const view of ['compact','expanded']){
const page=await browser.newPage({viewport:{width:1365,height:850}});
await page.setContent('<html><head><style>'+normalize(reqCSS)+'</style><style>'+normalize(compactCSS)+'</style></head><body><main id="page-solicitudes" data-stainher-solicitudes-view="'+view+'"><div class="v152-request-grid"><div id="vac" class="v152-request-card"><div data-r133-field="period">Vacaciones</div></div><div id="perm" class="v152-request-card"><div data-r133-field="period">Permisos</div></div><div id="otherActive" class="v152-request-card"><div data-r133-field="period">Otra activa</div></div><div id="otherFinal" class="v152-request-card"><div data-r133-field="period">Otra finalizada</div></div></div></main></body></html>');
for(const visible of [['vac'],['perm'],['otherActive'],['otherFinal']]){
await page.evaluate(visible=>{
for(const card of document.querySelectorAll('.v152-request-card'))card.classList.toggle('r180-filter-hidden',!visible.includes(card.id));
},visible);
const result=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.v152-request-card')].map(card=>[card.id,getComputedStyle(card).display])));
for(const [id,display] of Object.entries(result)){if(visible.includes(id))assert.notEqual(display,'none',view+' '+id+' must be visible');else assert.equal(display,'none',view+' '+id+' must be hidden');}
}
await page.close();
}
}finally{await browser.close()}
console.log('R281 filter visibility passes both compact and expanded modes, all categories and statuses');
