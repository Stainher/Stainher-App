import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const source=readFileSync('assets/stainher-v1524-boletas-rendir-r354.js','utf8');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.setContent('<section id="page-solicitudes"></section><section id="page-boletas-rendir"></section>');
 await page.evaluate(()=>{
  const manager='44b92981-9398-42cb-a334-a51baa876125';
  window.state={session:{user:{id:manager}}};
  const rows=[
   {id:'1',user_id:'a',nombre_solicitante:'Ana',estado:'pendiente',monto:1200},
   {id:'2',user_id:'a',nombre_solicitante:'Ana',estado:'reintegrado',monto:2500},
   {id:'3',user_id:'b',nombre_solicitante:'Bruno',estado:'pendiente',monto:600}
  ].map(row=>({...row,fecha_gasto:'2026-11-13',tipo_documento:'boleta',numero_documento:row.id,concepto:'Traslado'}));
  window.exports=[];
  window.ensurePdf=()=>class{
   setFontSize(){}
   text(value){window.pdfText=(window.pdfText||[]).concat(value);}
   autoTable(options){window.pdfRows=options.body;}
   save(name){window.exports.push({name,rows:window.pdfRows,text:window.pdfText});}
  };
  window.installCorporatePdfV95=()=>{};
  window.sb={auth:{getUser:async()=>({data:{user:window.state.session.user}})},from(table){
   const query={select(){return this;},eq(_field,value){this.filter=value;return this;},order(){return this;},
    maybeSingle(){return {data:{id:window.state.session.user.id,nombre:'Usuario'}};},
    limit(){return {data:table==='boletas_rendir_r354'?rows.filter(row=>!this.filter||this.filter===row.user_id):[]};}
   };
   return query;
  }};
 });
 await page.addScriptTag({content:source});
 await page.evaluate(()=>window.StainherBoletasR354.render());
 const download=page.getByRole('button',{name:'Descargar informe resumen'});
 assert.ok(await download.isDisabled());
 await page.getByLabel('Filtrar por usuario').selectOption('a');
 assert.equal(await page.locator('[data-r419-report-row]').count(),2);
 await page.getByLabel('Seleccionar todas las boletas del filtro').check();
 assert.match(await page.locator('#r419-report-total').textContent(),/2 seleccionadas.*3[.]700/);
 await download.click();
 let report=await page.evaluate(()=>window.exports[0]);
 assert.deepEqual(report.rows.map(row=>row[4]),['Pendiente','Reintegrado']);
 assert.match(report.text.join(' '),/Usuario: Ana/);
 await page.getByLabel('Seleccionar documento boleta 1',{exact:true}).uncheck();
 await download.click();
 report=await page.evaluate(()=>window.exports[1]);
 assert.equal(report.rows.length,1);
 assert.equal(report.rows[0][2],'boleta 2');
 await page.getByLabel('Filtrar por usuario').selectOption('b');
 assert.ok(await download.isDisabled());
 await page.evaluate(async()=>{
  window.state.session.user.id='a';
  await window.StainherBoletasR354.render();
 });
 assert.equal(await download.count(),0);
 assert.equal(await page.locator('#r419-report-user').count(),0);
 assert.equal(await page.getByText('Bruno',{exact:true}).count(),0);
}finally{await browser.close();}
