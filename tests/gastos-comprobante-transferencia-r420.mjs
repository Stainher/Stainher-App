import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.route('https://gastos.test/',route=>route.fulfill({contentType:'text/html',body:'<main id="contractContent"></main>'}));
 await page.goto('https://gastos.test/');
 await page.evaluate(()=>{
  const docs=['a','b'].map(id=>({id,fecha:'2026-11-10',monto:5000,realizado_por:'me',realizado_por_nombre:'Persona',numero_documento:id,tipo_documento:'boleta'}));
  const transfers=[{id:'anulada',anulada:true,monto_total:100}];
  window.state={profile:{rol:'administrador'},contractTab:'gastos_operacionales_r342'};
  window.uploads=[];
  window.calls=[];
  window.sb={
   auth:{getUser:async()=>({data:{user:{id:'me'}}})},
   from(table){
    let unpaid=false;
    return {select(){return this;},gte(){return this;},lt(){return this;},eq(){return this;},is(){unpaid=true;return this;},order(){return this;},limit(){return this;},in(){return this;},
     then(resolve){return Promise.resolve({data:table==='gastos_operacionales_r342'?docs.filter(row=>!unpaid||!row.transferencia_id):table==='gastos_transferencias_r348'?transfers:[]}).then(resolve);}
    };
   },
   storage:{from(bucket){return {upload:async path=>{window.uploads.push({bucket,path});return {};}};}},
   rpc:async(name,args)=>{
    window.calls.push({name,args});
    transfers.push({id:'nueva',monto_total:10000,comprobante_path:args.p_archivo});
    docs.forEach(row=>{row.transferencia_id='nueva';row.reembolso_personal_monto=row.monto;});
    return {data:'nueva'};
   }
  };
 });
 await page.addScriptTag({content:readFileSync('assets/stainher-v1524-gastos-r342.js','utf8')});
 await page.getByRole('button',{name:'Reembolsos'}).click();
 await page.locator('[data-r348-check]').first().check();
 await page.locator('[data-r348-check]').last().check();
 assert.equal(await page.locator('#r348-total').textContent(),'$10.000');
 assert.equal(await page.locator('[data-r420-transfer="anulada"]').count(),0);
 await page.locator('[name="transfer_proof"]').setInputFiles({name:'transferencia.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4')});
 await page.getByRole('button',{name:'Registrar transferencia'}).click();
 await page.getByRole('button',{name:'Ver comprobante'}).waitFor();
 const result=await page.evaluate(()=>({uploads:window.uploads,calls:window.calls}));
 assert.equal(result.uploads.length,1);
 assert.equal(result.calls[0].name,'registrar_transferencia_gastos_r420');
 assert.deepEqual(result.calls[0].args.p_gastos,['a','b']);
 assert.equal(result.calls[0].args.p_archivo,result.uploads[0].path);
 await page.getByRole('button',{name:'Historial',exact:true}).click();
 const status=page.getByRole('button',{name:'Transferido, ver transferencia'});
 await status.first().waitFor();
 assert.equal(await status.count(),2);
 assert.equal(await status.first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(20, 102, 64)');
 await status.first().click();
 await page.getByRole('button',{name:'Ver comprobante'}).waitFor();
}finally{await browser.close();}
