import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const view=readFileSync('assets/stainher-v1524-solicitudes-view-r133.js','utf8');
const close=readFileSync('assets/stainher-v1524-request-close-r177.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
assert.match(close,/requestCategory\(row\.tipo\)==='otras'/);
assert.match(close,/row\.created_at/);
assert.match(close,/timeZone:'America\/Santiago'/);
assert.match(view,/@container \(max-width:1050px\)/);
assert.match(view,/@container \(max-width:640px\)/);
assert.match(loader,/R28[01]/);
const browser=await chromium.launch({headless:true});
try {
for(const width of [390,760,1024,1440]){
 const page=await browser.newPage({viewport:{width,height:850}});
 await page.setContent('<html><head><style>.v152-request-grid{container-type:inline-size}.v152-request-card{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;width:100%;box-sizing:border-box}.v154-request-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}.v154-request-actions button{max-width:100%;min-width:0;white-space:normal}@container(max-width:1050px){.v152-request-card{grid-template-columns:repeat(3,minmax(0,1fr))}}@container(max-width:640px){.v152-request-card{grid-template-columns:repeat(2,minmax(0,1fr))}}@container(max-width:390px){.v152-request-card{grid-template-columns:1fr}}</style></head><body><div style="width:100%;max-width:100%;box-sizing:border-box;padding:12px" class="v152-request-grid"><div class="v152-request-card"><div>Período</div><div>Persona</div><div>Tipo</div><div>Aprobación</div><div>Estado</div><div class="v154-request-actions"><button>Reasignar a Cristian Lagos</button><button>Eliminar</button><button>Marcar como finalizada</button></div></div></div></body></html>');
 const measured=await page.evaluate(()=>{
  const card=document.querySelector('.v152-request-card'),actions=card.querySelector('.v154-request-actions');
  return {columns:getComputedStyle(card).gridTemplateColumns.split(' ').length,actionsWidth:actions.getBoundingClientRect().width,cardWidth:card.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert.equal(measured.overflow,false,'No horizontal clipping at '+width);
 assert.ok(measured.actionsWidth<=measured.cardWidth,'Actions remain within card at '+width);
 await page.close();
}
}finally{await browser.close()}
console.log('R280 zoom layout tests passed');