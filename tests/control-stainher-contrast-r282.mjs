import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('assets/stainher-v1524-theme.js','utf8');
const start=source.indexOf('const css=\x60');
assert.ok(start>=0);
const css=source.slice(start+10,source.indexOf('\x60;',start));
const browser=await chromium.launch({headless:true});
try{
for(const theme of ['light','modern','dark']){
 const page=await browser.newPage({viewport:{width:1260,height:850}});
 await page.setContent('<html data-theme="'+theme+'"><head><style>.section-v95,.v13-check-section,.v13-check-row,.v12-form-table{background:#101820;color:#132436}.section-v95 h3,.v13-check-row span,.v12-form-table td{color:#112638}.v13-check-row{border:1px solid #142234}</style><style>'+css+'</style></head><body><div id="modalRoot"><section class="section-v95"><h3>Datos principales</h3><label>Supervisor</label><input class="field"></section><section class="v13-check-section"><h4>Chequeo del vehículo</h4><div class="v13-check-row"><span>Sistema de frenos</span><button>Bueno</button></div></section><table class="v12-form-table"><tr><td>Inspección ambiental</td></tr></table></div></body></html>');
 const computed=await page.evaluate(()=>{
 const props=sel=>{const s=getComputedStyle(document.querySelector(sel));return {background:s.backgroundColor,color:s.color}};
 return {surface:props('.section-v95'),label:props('.v13-check-row span'),row:props('.v13-check-row'),table:props('.v12-form-table td')};
 });
 if(theme!=='dark'){
  assert.ok(['rgb(245, 249, 253)','rgb(255, 255, 255)'].includes(computed.surface.background));
  assert.equal(computed.label.color,'rgb(25, 53, 77)');
  assert.ok(['rgb(245, 249, 253)','rgb(255, 255, 255)'].includes(computed.row.background));
  assert.equal(computed.table.color,'rgb(25, 53, 77)');
 }else assert.equal(computed.surface.background,'rgb(16, 24, 32)');
 await page.close();
}
}finally{await browser.close()}
console.log('R282 shared controls contrast pass light/modern; dark preserved');