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
const DB_NAME="stainher-rit-template-r331",DB_STORE="documentos",KEY="RIT_Codelco_original";
const APPROVED_SHA256=new Set(["afa4a550b8e4fb2c0c63bcad4f18d75fb7e65ca328551f8f3f990ec3a3680717","1838c693e1d58d1a0d45e55c518bb1ee027a915596067dadda7095c196d85b20"]);
async function verifyFingerprint(bytes){
 if(!crypto?.subtle)throw Error("El navegador no puede verificar la integridad del RIT.");
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 if(!APPROVED_SHA256.has(hex))throw Error("La plantilla PDF no coincide con la versión Codelco aprobada para R331.");
}

function templateDB(){
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB)return reject(Error("Este navegador no permite guardar la plantilla PDF."));
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(DB_STORE))request.result.createObjectStore(DB_STORE)};
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>resolve(request.result);
 });
}
async function readLocalTemplate(){
 const database=await templateDB();
 return new Promise((resolve,reject)=>{
  const tx=database.transaction(DB_STORE,"readonly"),req=tx.objectStore(DB_STORE).get(KEY);
  req.onsuccess=()=>{database.close();resolve(req.result||null)};
  req.onerror=()=>{database.close();reject(req.error)};
 });
}
async function saveLocalTemplate(bytes){
 const database=await templateDB();
 return new Promise((resolve,reject)=>{
  const tx=database.transaction(DB_STORE,"readwrite");
  tx.objectStore(DB_STORE).put(bytes,KEY);
  tx.oncomplete=()=>{database.close();resolve(true)};
  tx.onerror=()=>{database.close();reject(tx.error)};
 });
}
async function checkTemplate(bytes){
 const buf=bytes instanceof ArrayBuffer?bytes:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 if(new TextDecoder().decode(buf.slice(0,5))!=="%PDF-")throw Error("El archivo seleccionado no es PDF.");
 await verifyFingerprint(buf);
 const lib=await library();
 const doc=await lib.PDFDocument.load(buf,{updateMetadata:false});
 const pages=doc.getPages();
 if(pages.length!==2)throw Error("El RIT original debe tener exactamente dos páginas.");
 for(const p of pages){
  if(Math.abs(p.getWidth()-1191)>3||Math.abs(p.getHeight()-842)>3)throw Error("La plantilla debe ser A3 horizontal en ambas páginas.");
 }
 return buf;
}
async function importTemplate(file){
 if(!file||file.size>3*1024*1024)throw Error("Seleccione el RIT original PDF (máximo 3 MB).");
 const bytes=await checkTemplate(await file.arrayBuffer());
 await saveLocalTemplate(bytes);
 return true;
}
async function bundledTemplate(){
 let encoded="";
 for(let i=0;i<15;i++){
  const name="r331-part-"+String(i).padStart(2,"0")+".txt";
  const response=await fetch("assets/rit-template/"+name,{cache:"force-cache"});
  if(!response.ok)throw Error("Falta el fragmento "+name+" de la plantilla oficial.");
  let part=(await response.text()).trim();
  if(i>=4)part=part.split("").reverse().join("");
  encoded+=part;
 }
 const binary=atob(encoded),bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 return checkTemplate(bytes.buffer);
}
async function getTemplate(){
 try{
  const response=await fetch(TEMPLATE,{cache:"no-store"});
  if(response.ok)return await checkTemplate(await response.arrayBuffer());
 }catch(_){ /* Branch without installed static template: read saved local original. */ }
 try{return await bundledTemplate()}catch(error){console.warn("[Stainher RIT] Plantilla empaquetada no disponible:",error?.message)}
 const local=await readLocalTemplate().catch(()=>null);
 if(!local)throw Error("No se ha instalado la plantilla original de Codelco. Importe el PDF desde el apartado RIT.");
 return checkTemplate(local);
}
async function hasTemplate(){
 try{await getTemplate();return true}catch(_){return false}
}
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
 const drawRows=(str,x,top,maxWidth)=>{
  const value=text(str);if(!value)return;
  const tokens=value.split(/\s+/);
  for(let size=7;size>=6;size-=0.25){
   const lines=[""];
   for(const word of tokens){
    const n=lines.length-1,candidate=lines[n]?lines[n]+" "+word:word;
    if(font.widthOfTextAtSize(candidate,size)<=maxWidth)lines[n]=candidate;
    else lines.push(word);
   }
   if(lines.length<=2&&lines.every(line=>font.widthOfTextAtSize(line,size)<=maxWidth)){
    lines.forEach((line,i)=>page.drawText(line,{x,y:height-(top+i*7.4)-size,size,font,color:{type:"RGB",red:0.07,green:0.33,blue:0.73}}));
    return;
   }
  }
  throw Error("El análisis excede el espacio de dos líneas del formato Codelco: "+value.slice(0,35));
 };
 return {draw,drawRows,cross};
}
function dataCheck(r){
 if(!r||!r.fecha||!r.supervisor||!r.area)throw Error("Complete los datos generales antes de exportar.");
 if(!Array.isArray(r.actividades)||!r.actividades.length||r.actividades.length>6)throw Error("El RIT requiere entre una y seis actividades.");
 if((r.aportes||[]).length>4||(r.reconocimientos||[]).length>4)throw Error("La sección de aportes o reconocimientos supera el formulario.");
}
async function buildPdf(record){
 dataCheck(record);
 const bytes=await getTemplate();
 const lib=await library();
 const doc=await lib.PDFDocument.load(bytes,{updateMetadata:false});
 if(doc.getPageCount()!==2)throw Error("Plantilla no autorizada: debe conservar exactamente dos páginas.");
 const pg=doc.getPage(0),rev=doc.getPage(1);
 if(Math.abs(pg.getWidth()-1191)>3||Math.abs(pg.getHeight()-842)>3||Math.abs(rev.getWidth()-1191)>3)throw Error("Dimensiones de la plantilla RIT no coinciden con el documento original A3.");
 const font=await doc.embedFont(lib.StandardFonts.Helvetica),{draw,drawRows,cross}=makeWriter(pg,font);
 const blue={red:0.07,green:0.33,blue:0.73};
 // Cabecera: campo / valor dentro de celda; coordenadas sobre el PDF original.
 draw(clip(record.centro,65),145,78,8,154);
 draw(clip(record.gerencia,65),375,78,8,225);
 draw(clip(record.empresa,65),808,78,8,120);
 draw(clip(record.area,65),1024,78,8,156);
 const fecha=String(record.fecha||"").split("-");draw(fecha.length===3?fecha.reverse().join("-"):record.fecha,87,96,8,150);
 draw(record.turno,376,96,8,70);
 draw(clip(record.supervisor,70),681,96,8,196);
 draw(String(record.asistentes??""),1053,96,8,90);
 for(const rf of record.riesgos||[]){
  const pos=RF_COORD[rf];if(!pos)throw Error("RF no presente en la portada del RIT: "+rf);
  cross(33+141.7*pos[0],136.5+23.8*pos[1]);
 }
 const items=["Instructivos","Materiales","Herramientas","EPP"];
 record.actividades.forEach((a,i)=>{
  const y=278+i*69.7;
  draw(clip(a.nombre||"",90),41,y+26,8,128);
  items.forEach((item,j)=>{
   const val=a.preparacion?.[item];
   if(val==="si")cross(239,y+j*17.4+3);
   if(val==="no")cross(259,y+j*17.4+3);
  });
  if((a.riesgos||[]).length>4)throw Error("La actividad "+(i+1)+" excede las cuatro filas RF del formato original.");
  (a.riesgos||[]).forEach((r,j)=>{
   const rowY=y+j*17.4;
   draw(String(r.rf||"").replace(/^RF/i,""),289,rowY+3,7,17);
   drawRows(clip(r.riesgo,90),323,rowY+2,165);
   drawRows(clip(r.consecuencia,135),492,rowY+2,302);
   drawRows(clip(r.controles,145),805,rowY+2,375);
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
 const filename="RIT_"+String(record.fecha||"sin-fecha")+"_"+text(record.supervisor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_")+".pdf";
 return {output,filename};
}
function downloadBuilt({output,filename}){
 const url=URL.createObjectURL(new Blob([output],{type:"application/pdf"}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function exportPdf(record){const built=await buildPdf(record);downloadBuilt(built);return true}
window.StainherRITPDF=Object.freeze({exportPdf,buildPdf,downloadBuilt,importTemplate,hasTemplate,template:TEMPLATE,coordinates:RF_COORD});
})();