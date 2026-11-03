/* R331 · PDF RIT Codelco.
 * Overlay sobre plantilla original de dos páginas A3 horizontal.
 * No genera ni sustituye el formulario si falta la plantilla.
 */
(()=>{
"use strict";
if(window.StainherRITPDF)return;
const TEMPLATE="assets/RIT_Codelco_original.pdf";
const PDFLIB_URL="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
const RF_COORD={
 RF01:[0,0],RF02:[1,0],RF03:[2,0],RF04:[3,0],RF05:[4,0],RF07:[6,0],RF08:[7,0],
 RF09:[0,1],RF10:[1,1],RF11:[2,1],RF12:[3,1],RF13:[4,1],RF14:[5,1],RF15:[6,1],RF16:[7,1],
 RF17:[0,2],RF18:[1,2],RF19:[2,2],RF22:[5,2],RF23:[6,2],RF24:[7,2],
 RF25:[0,3],RF30:[5,3]
};
const cache={ready:null};
async function library(){
 if(window.PDFLib)return window.PDFLib;
 if(!cache.ready)cache.ready=new Promise((resolve,reject)=>{
  const el=document.createElement("script");el.src=PDFLIB_URL;el.crossOrigin="anonymous";
  el.onload=()=>window.PDFLib?resolve(window.PDFLib):reject(Error("pdf-lib no disponible"));
  el.onerror=()=>reject(Error("No se pudo cargar el motor de PDF"));
  document.head.appendChild(el);
 });
 return cache.ready;
}
function text(value){return String(value??"").trim().replace(/[\u0000-\u001f]/g," ");}
function clip(s,max){const v=text(s);if(v.length>max)throw Error("El campo supera el espacio disponible en el PDF: "+v.slice(0,30)+"…");return v;}
function makeWriter(page,font){
 const height=page.getHeight();
 const draw=(str,x,top,size=8,maxWidth=140)=>{
  const v=text(str);if(!v)return;
  let current=size;
  while(current>=5&&font.widthOfTextAtSize(v,current)>maxWidth)current-=0.25;
  if(current<5)throw Error("Texto demasiado extenso para la celda del PDF: "+v.slice(0,28));
  page.drawText(v,{x,y:height-top-current,size:current,font,color:{type:"RGB",red:0.07,green:0.33,blue:0.73}});
 };
 const cross=(x,top)=>{page.drawLine({start:{x:x+1,y:height-top-2},end:{x:x+7,y:height-top-8},thickness:1.4,color:{type:"RGB",red:0.05,green:0.25,blue:0.65}});page.drawLine({start:{x:x+7,y:height-top-2},end:{x:x+1,y:height-top-8},thickness:1.4,color:{type:"RGB",red:0.05,green:0.25,blue:0.65}});};
 return {draw,cross};
}
function dataCheck(r){
 if(!r||!r.fecha||!r.supervisor||!r.area)throw Error("Complete los datos generales antes de exportar.");
 if(!Array.isArray(r.actividades)||!r.actividades.length||r.actividades.length>6)throw Error("El RIT requiere entre una y seis actividades.");
 if((r.aportes||[]).length>4||(r.reconocimientos||[]).length>4)throw Error("La sección de aportes o reconocimientos supera el formulario.");
}
async function exportPdf(record){
 dataCheck(record);
 const response=await fetch(TEMPLATE,{cache:"no-store"});
 if(!response.ok)throw Error("Plantilla oficial del RIT aún no instalada en la aplicación. No se ha generado un documento alternativo.");
 const bytes=await response.arrayBuffer();
 const signature=new TextDecoder().decode(bytes.slice(0,5));
 if(signature!=="%PDF-")throw Error("La plantilla RIT descargada no es un PDF válido.");
 const lib=await library();
 const doc=await lib.PDFDocument.load(bytes,{updateMetadata:false});
 if(doc.getPageCount()!==2)throw Error("Plantilla no autorizada: debe conservar exactamente dos páginas.");
 const pg=doc.getPage(0),rev=doc.getPage(1);
 if(Math.abs(pg.getWidth()-1191)>3||Math.abs(pg.getHeight()-842)>3||Math.abs(rev.getWidth()-1191)>3)throw Error("Dimensiones de la plantilla RIT no coinciden con el documento original A3.");
 const font=await doc.embedFont(lib.StandardFonts.Helvetica),{draw,cross}=makeWriter(pg,font);
 const blue={red:0.07,green:0.33,blue:0.73};
 // Cabecera: campo / valor dentro de celda; coordenadas sobre el PDF original.
 draw(clip(record.centro,65),145,78,8,154);
 draw(clip(record.gerencia,65),375,78,8,225);
 draw(clip(record.empresa,65),808,78,8,120);
 draw(clip(record.area,65),1024,78,8,156);
 const fecha=String(record.fecha||"").split("-");draw(fecha.length===3?fecha.reverse().join("-"):record.fecha,87,96,8,150);
 draw(record.turno,376,96,8,70);
 draw(clip(record.supervisor,70),729,96,8,160);
 draw(String(record.asistentes??""),1053,96,8,90);
 for(const rf of record.riesgos||[]){
  const pos=RF_COORD[rf];if(!pos)throw Error("RF no presente en la portada del RIT: "+rf);
  cross(36+144.5*pos[0],140+23.3*pos[1]);
 }
 const items=["Instructivos","Materiales","Herramientas","EPP"];
 record.actividades.forEach((a,i)=>{
  const y=278+i*69.7;
  draw(clip(a.nombre||"",90),41,y+26,8,128);
  items.forEach((item,j)=>{
   const val=a.preparacion?.[item];
   if(val==="si")cross(229,y+j*17.4+3);
   if(val==="no")cross(249,y+j*17.4+3);
  });
  if((a.riesgos||[]).length>4)throw Error("La actividad "+(i+1)+" excede las cuatro filas RF del formato original.");
  (a.riesgos||[]).forEach((r,j)=>{
   const rowY=y+j*17.4;
   draw(String(r.rf||"").replace(/^RF/i,""),301,rowY+3,7,17);
   draw(clip(r.riesgo,90),323,rowY+3,7,165);
   draw(clip(r.consecuencia,135),492,rowY+3,7,302);
   draw(clip(r.controles,145),805,rowY+3,7,375);
  });
 });
 (record.aportes||[]).slice(0,4).forEach((a,i)=>{
  draw(clip(a.propuesta,75),32,737+i*17,7,395);
  draw(clip(a.responsable,45),440,737+i*17,7,170);
  draw(a.fecha,616,737+i*17,7,100);
 });
 (record.reconocimientos||[]).slice(0,4).forEach((a,i)=>{
  draw(clip(a.quien,40),751,737+i*17,7,150);
  draw(clip(a.motivo,75),906,737+i*17,7,270);
 });
 // Página 2 se conserva sin alteraciones: guía Codelco oficial.
 const output=await doc.save({useObjectStreams:false});
 const url=URL.createObjectURL(new Blob([output],{type:"application/pdf"}));
 const filename="RIT_"+String(record.fecha||"sin-fecha")+"_"+text(record.supervisor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_")+".pdf";
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 return true;
}
window.StainherRITPDF=Object.freeze({exportPdf,template:TEMPLATE,coordinates:RF_COORD});
})();