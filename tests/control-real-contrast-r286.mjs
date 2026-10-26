import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
const browser=await chromium.launch({headless:true});
try{
for(const theme of ['light','modern','dark']){
const page=await browser.newPage({viewport:{width:1024,height:800}});
await page.setContent('<html data-theme="'+theme+'"><head><style>.v156-page-card,.v11-group-title{background:#101820;color:#15293a}.v11-eval button{background:#101820;color:#fff}</style><style>'+css+'</style></head><body><div id="modalRoot"><div class="v156-page-card"><h4>Datos principales</h4><label>Patente camioneta<input></label></div><div class="v11-group"><div class="v11-group-title">Orden, limpieza y demarcación</div><div class="v11-observation-row"><div>Verifica rutas</div><div class="v11-eval"><button data-v="Conducta segura">Conducta segura</button><button data-v="Conducta preocupante">Conducta preocupante</button><button data-v="No aplica">No aplica</button></div></div></div></div></body></html>');
if(theme!=='dark'){
const a=await page.evaluate(()=>({card:getComputedStyle(document.querySelector('.v156-page-card')).backgroundColor,header:getComputedStyle(document.querySelector('.v11-group-title')).backgroundColor}));
assert.equal(a.card,'rgb(243, 248, 253)');assert.equal(a.header,'rgb(243, 248, 253)');
const colors=['rgb(23, 115, 69)','rgb(180, 35, 54)','rgb(243, 190, 62)'];
for(let i=0;i<3;i++){
await page.evaluate(i=>{const b=[...document.querySelectorAll('.v11-eval button')];b.forEach((el,n)=>el.classList.toggle('active',n===i));},i);
const actual=await page.locator('.v11-eval button.active').evaluate(el=>getComputedStyle(el).backgroundColor);
assert.equal(actual,colors[i]);
}
}else assert.equal(await page.locator('.v156-page-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(16, 24, 32)');
await page.close();
}
}finally{await browser.close()}
console.log('R286 real selectors contrast and safe/worry/NA colors OK');