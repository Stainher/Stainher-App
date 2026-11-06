import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const src=fs.readFileSync('assets/stainher-v1524-extintores-pdf-r378.js','utf8');
new Function(src);
const checks=['manguera','boquilla','traslado','manometro','manijas','senalizacion','acceso'];
function fakeDoc(){
 let page=1;let y=30;const records=[];
 const doc={
  records, internal:{getNumberOfPages:()=>page},
  setFillColor(){},rect(){},setTextColor(){},setFont(){},setFontSize(){},setDrawColor(){},
  text(value,...args){records.push({kind:'text',page,value:String(value)})},
  splitTextToSize(value){return String(value).split('\n').flatMap(line=>line.match(/.{1,90}/g)||[''])},
  addImage(){records.push({kind:'signature',page})},
  addPage(){page++;y=30;return this},
  setPage(p){page=p},
  autoTable(opts){
   records.push({kind:'table',page,body:opts.body,head:opts.head});
   let height=opts.body.length*8+10;
   if(y+height>267){page++;y=31;opts.didDrawPage?.();}
   y+=height;
   doc.lastAutoTable={finalY:y};
   opts.didDrawPage?.();
  }
 };
 return doc;
}
test('R378: PDF contiene todos los extintores dinámicos y las siete verificaciones',()=>{
 const ctx={window:{jspdf:{jsPDF:fakeDoc}},console};
 vm.runInNewContext(src,ctx);
 const rows=Array.from({length:9},(_,i)=>Object.fromEntries([
  ['n',i+1],['ubicacion','Sector '+(i+1)],['clase','ABC'],['capacidad','10 kg'],
  ['carga','2026-01-01'],['vence','2027-01-01'],
  ...checks.map(k=>[k,i%2?'Malo':'Bueno'])
 ]));
 const doc=ctx.window.StainherExtintorPdfR378.build({
  supervisor_nombre:'Supervisor Prueba',fecha:'2026-11-06',area:'Andina',rows,
  observacion:'Observación detallada de todos los extintores',plan:'Revisar y corregir',
  responsable:'Responsable Prueba',fecha_accion:'2026-11-09',firma:'data:image/png;base64,TEST'
 });
 const joined=doc.records.filter(x=>x.kind==='table').flatMap(x=>x.body.flat()).map(String).join('|');
 for(let i=1;i<=9;i++)assert.ok(joined.includes('Sector '+i),'Falta extintor '+i);
 for(const check of ['Manguera','Boquilla','Manilla de traslado','Manómetro','Manijas','Señalización','Acceso'])
  assert.ok(joined.includes(check),'Falta verificación '+check);
 assert.ok(doc.records.some(x=>x.kind==='signature'));
 assert.ok(doc.records.some(x=>x.value.includes('Observación detallada')));
 assert.ok(doc.records.some(x=>x.value.includes('Plan de acción')));
 assert.ok(doc.internal.getNumberOfPages()>2,'Debe paginar sin límite fijo de dos páginas');
 const footers=doc.records.filter(x=>x.value?.startsWith('Página '));
 assert.equal(footers.length,doc.internal.getNumberOfPages(),'Todas las páginas llevan numeración');
});
test('R378: integración disponible desde el cargador de módulos',()=>{
 const loader=fs.readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
 assert.match(loader,/refreshExtintoresPdfR378/);
 assert.match(loader,/stainher-v1524-extintores-pdf-r378\.js/);
});
