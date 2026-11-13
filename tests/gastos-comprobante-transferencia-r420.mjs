import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.route('https://gastos.test/',route=>route.fulfill({contentType:'text/html',body:'<main id="contractContent"></main>'}));
 await page.goto('https://gastos.test/');
 await page.clock.setFixedTime(new Date('2026-11-13T15:00:00Z'));
 await page.evaluate(()=>{
  const docs=['a','b'].map(id=>({id,fecha:'2026-11-10',monto:5000,realizado_por:'me',realizado_por_nombre:'Persona',numero_documento:id,tipo_documento:'boleta'}));
  docs.push({id:'historico',fecha:'2026-11-10',monto:1000,reembolso_personal_monto:1000,numero_documento:'histórico'});
  docs.push(
   {id:'oct',fecha:'2026-10-30',monto:3000,reembolso_personal_monto:3000,transferencia_id:'mixta',numero_documento:'octubre'},
   {id:'sep',fecha:'2026-09-30',monto:4000,reembolso_personal_monto:4000,transferencia_id:'mixta',numero_documento:'septiembre'},
   {id:'pend-oct',fecha:'2026-10-20',monto:1000,realizado_por:'me',realizado_por_nombre:'Persona',numero_documento:'pendiente-oct'}
  );
  const transfers=[{id:'anulada',anulada:true,monto_total:100},{id:'mixta',fecha:'2026-11-02',monto_total:7000,comprobante_path:'mixta.pdf'}];
  window.state={profile:{rol:'administrador'},contractTab:'gastos_operacionales_r342'};
  window.uploads=[];
  window.calls=[];
  window.sb={
   auth:{getUser:async()=>({data:{user:{id:'me'}}})},
   from(table){
    let from='',until='9999',ids=[];
    return {select(){return this;},gte(_col,value){from=value;return this;},lt(_col,value){until=value;return this;},eq(){return this;},order(){return this;},in(_col,values){ids=values;return this;},
     then(resolve){return Promise.resolve({data:table==='gastos_operacionales_r342'?docs.filter(row=>row.fecha>=from&&row.fecha<until):table==='gastos_transferencias_r348'?transfers.filter(row=>ids.includes(row.id)):[]}).then(resolve);}
    };
   },
   storage:{from(bucket){return {upload:async path=>{window.uploads.push({bucket,path});return {};}};}},
   rpc:async(name,args)=>{
    window.calls.push({name,args});
    transfers.push({id:'nueva',fecha:'2026-12-01',monto_total:10000,comprobante_path:args.p_archivo});
    docs.filter(row=>args.p_gastos.includes(row.id)).forEach(row=>{row.transferencia_id='nueva';row.reembolso_personal_monto=row.monto;});
    return {data:'nueva'};
   }
  };
 });
 await page.addScriptTag({content:readFileSync('assets/stainher-v1524-gastos-r342.js','utf8')});
 await page.getByRole('button',{name:'Reembolsos'}).click();
 assert.equal(await page.locator('[data-r348-check]').count(),2);
 assert.equal(await page.locator('[data-r420-transfer="mixta"]').count(),0);
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
 const styles=await page.locator('.r420-transferred').evaluateAll(nodes=>nodes.map(node=>{
  const css=getComputedStyle(node),rect=node.getBoundingClientRect();
  return [rect.width,rect.height,css.fontFamily,css.fontSize,css.fontWeight,css.color,css.backgroundColor];
 }));
 assert.equal(styles.length,3);
 assert.deepEqual(styles[0],styles[2]);
 await status.first().click();
 await page.getByRole('button',{name:'Ver comprobante'}).waitFor();
 await page.locator('#r345-period-month').selectOption('10');
 const october=page.locator('[data-r420-transfer="mixta"]');
 await october.waitFor();
 assert.match(await october.innerText(),/2026-11-02.*octubre.*\$3\.000/s);
 assert.doesNotMatch(await october.innerText(),/septiembre|7\.000/);
 assert.equal(await page.locator('[data-r348-check]').count(),1);
 assert.equal(await page.locator('[data-r420-transfer="nueva"]').count(),0);
 await page.locator('#r345-period-month').selectOption('09');
 await page.getByText('septiembre',{exact:true}).waitFor();
 assert.match(await october.innerText(),/septiembre.*\$4\.000/s);
}finally{await browser.close();}
