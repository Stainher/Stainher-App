import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';

test('R373: RPC correcto seguido de falla al refrescar no debe decir que falló el reemplazo',async()=>{
 const src=fs.readFileSync('assets/stainher-v1524-correctivo-replace-r364.js','utf8');
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage();
 await page.setContent('<html><body><div id="page-correctivo"><div id="corrBody"></div></div></body></html>');
 await page.evaluate(()=>{
  window.state={profile:{rol:'administrador'},session:{user:{id:'test'}}};
  window.__notices=[];
  window.toast=(msg,type)=>window.__notices.push({msg,type});
  window.XLSX={read:()=>({SheetNames:['Carga'],Sheets:{Carga:{}}}),utils:{sheet_to_json:()=>[
   ['Equipo','Fecha inicio trabajo','Hora inicio trabajo','Observaciones'],
   ['JAULA ASEA',46035,0.45833333333,'Nueva descripción']
  ]},SSF:{parse_date_code:n=>({y:2026,m:1,d:13})}};
  window.sb={
   from:()=>({select:async()=>({count:72,error:null})}),
   rpc:async(name,args)=>({data:{nuevos:1,respaldo_id:'respaldo-ejemplo'},error:null})
  };
  window.confirm=()=>true;
  window.prompt=()=> 'REEMPLAZAR';
  window.renderCorrectivo=async()=>{throw new TypeError("Cannot read properties of undefined (reading 'rows')")};
 });
 await page.addScriptTag({content:src});
 const file=page.locator('[data-r369-file]');
 await file.setInputFiles({name:'Planilla.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from('fake')});
 await page.waitForFunction(()=>document.querySelector('.r369-status')?.textContent.includes('No repita la importación'));
 const result=await page.evaluate(()=>({status:document.querySelector('.r369-status').textContent,notices:window.__notices}));
 assert.match(result.status,/Base reemplazada correctamente/);
 assert.match(result.status,/No repita la importación/);
 assert.equal(result.notices.some(x=>/No se reemplazó|No se confirmó/.test(x.msg)),false);
 assert.equal(result.notices.some(x=>x.type==='success'),true);
 }finally{await browser.close()}
});
