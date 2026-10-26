import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const index=readFileSync('index.html','utf8'),css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
assert.match(index,/updated\.focus\(\{preventScroll:true\}\)/);
assert.match(index,/updatedRow\.dataset\.r283Selected='1'/);
assert.match(index,/previous\.expanded/);
assert.match(css,/@container \(max-width:1150px\)/);
const browser=await chromium.launch({headless:true});
try{
  for(const width of [390,760,1100,1440]){
    const page=await browser.newPage({viewport:{width,height:800}});
    const th=['Fecha','Equipo','Guía','Responsable','Duración','Estado','Observación','Excluir KPI','Motivo','Acción'];
    const cells=th.map((label,i)=>'<td>'+(i===7?'<input type="checkbox">':i===8?'<select><option>causa externa</option></select>':i===9?'<button>Eliminar</button>':label)+'</td>').join('');
    await page.setContent('<!doctype html><html><head><style>body{margin:0;padding:10px;background:#eef4f9}#page-correctivo .panel{max-width:100%;border:1px solid #bdccda;padding:8px;box-sizing:border-box}.corr-history-v8{border-collapse:collapse}.corr-history-v8 th,.corr-history-v8 td{padding:8px;border:1px solid #ccd8e0}select{max-width:100%}</style><style>'+css+'</style></head><body><main id="page-correctivo"><div class="panel"><div style="overflow:auto"><table class="corr-history-v8"><thead><tr>'+th.map(t=>'<th>'+t+'</th>').join('')+'</tr></thead><tbody><tr>'+cells+'</tr></tbody></table></div></div></main></body></html>');
    const got=await page.evaluate(()=>{
      const tr=document.querySelector('.corr-history-v8 tbody tr'),action=tr.lastElementChild.getBoundingClientRect(),container=document.querySelector('.panel').getBoundingClientRect();
      return {display:getComputedStyle(tr).display,actionVisible:action.width>0,documentOverflow:document.documentElement.scrollWidth>innerWidth,within:action.right<=container.right+1};
    });
    assert.equal(got.actionVisible,true,'Action must remain visible at '+width);
    assert.equal(got.documentOverflow,false,'No horizontal page overflow at '+width);
    if(width<=1100)assert.equal(got.within,true,'Action within card at '+width);
    await page.close();
  }
}finally{await browser.close()}
console.log('R283 responsive corrective history and KPI focus requirements passed');
