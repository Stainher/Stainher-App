/* R364: Importación de averías con reemplazo atómico y respaldo */
(()=>{
'use strict';
if(window.StainherCorrectivoReplaceR364)return;
const id='stainher-corr-replace-r364';
const role=()=>String(window.state?.profile?.rol||window.state?.profile?.role||window.v11Role?.()||'').toLowerCase().trim();
let confirmedRole='',lastRoleCheck=0,roleCheckRunning=false;
async function resolveRole(){
 if(allowed())return role();
 if(confirmedRole&&Date.now()-lastRoleCheck<30000)return confirmedRole;
 if(roleCheckRunning)return '';
 const sb=client();if(!sb?.rpc)return '';
 roleCheckRunning=true;
 try{
  const response=await sb.rpc('mi_rol');
  if(!response.error){
   confirmedRole=String(response.data||'').toLowerCase().trim();
   lastRoleCheck=Date.now();
  }
 }catch(error){console.warn('[R369] No se pudo verificar perfil de importación',error)}
 finally{roleCheckRunning=false}
 return confirmedRole;
}
const allowed=()=>['confiabilidad','administrador'].includes(role()||confirmedRole);
const client=()=>window.sb;
const toast=(msg,type='info')=>window.toast?.(msg,type)||console.info('[R364]',msg);
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const names={
 equipo_original:['equipo','nombre equipo','nombre del equipo','equipo original','ascensor','instalacion'],
 numero_guia:['numero guia','n guia','nro guia','guia','numero de guia','ot','orden de trabajo','n guia de trabajo','numero de guia de trabajo','nro de guia de trabajo','guia de trabajo'],
 supervisor_tecnico:['supervisor tecnico','responsable','supervisor','tecnico','encargado','supervisor y tecnico'],
 fecha_inicio:['fecha inicio','fecha de inicio','fecha de inicio de trabajo','fecha falla','fecha de falla','inicio'],
 hora_inicio:['hora inicio','hora de inicio','hora falla','hora de falla'],
 fecha_termino:['fecha termino','fecha de termino','fecha de termino de trabajo','fecha fin','fecha restitucion','fecha de restitucion'],
 hora_termino:['hora termino','hora fin','hora restitucion','hora de restitucion'],
 estado_final:['estado final','estado','resultado','condicion final'],
 observaciones:['observaciones','observacion','detalle','descripcion','causa','descripcion averia'],
 duracion_minutos:['duracion minutos','duracion min','minutos','tiempo detencion min','tiempo falla minutos','duracion atencion','duracion de atencion','tiempo de atencion','tiempo de indisponibilidad'],
 id_falla:['id falla','id de falla','codigo falla','id averia','numero falla','n falla'],
 fecha_hora_falla:['fecha hora falla','fecha y hora falla','fecha hora de falla','fecha y hora de falla','fecha hora inicio','fecha/hora falla','fecha hora de inicio de trabajo','fecha hora inicio de trabajo','fecha y hora inicio de trabajo','fecha hora de inicio'],
 fecha_hora_restitucion:['fecha hora restitucion','fecha y hora restitucion','fecha hora termino','fecha hora fin','fecha/hora restitucion','fecha hora termino de trabajo','fecha y hora termino de trabajo','fecha hora de termino de trabajo','fecha hora de termino','fecha hora fin trabajo'],
 excluir_kpi:['excluir kpi','excluir del kpi'],
 motivo_exclusion:['motivo exclusion'],
 observacion_exclusion:['observacion exclusion']
};
const alias=new Map();
Object.entries(names).forEach(([field,list])=>list.forEach(word=>alias.set(norm(word),field)));
const pad=n=>String(n).padStart(2,'0');
function dateCell(v){
 if(v===null||v===undefined||v==='')return null;
 if(v instanceof Date)return [v.getFullYear(),pad(v.getMonth()+1),pad(v.getDate())].join('-');
 if(typeof v==='number'){
  const d=window.XLSX?.SSF?.parse_date_code(v);
  if(d?.y&&d?.m&&d?.d)return [d.y,pad(d.m),pad(d.d)].join('-');
 }
 const s=String(v).trim();
 let m=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
 if(m)return m[1]+'-'+pad(m[2])+'-'+pad(m[3]);
 m=s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
 if(m)return m[3]+'-'+pad(m[2])+'-'+pad(m[1]);
 return null;
}
function timeCell(v){
 if(v===null||v===undefined||v==='')return null;
 if(v instanceof Date)return pad(v.getHours())+':'+pad(v.getMinutes());
 if(typeof v==='number'){
  const fraction=((v%1)+1)%1;
  const minutes=Math.round(fraction*1440)%1440;
  return pad(Math.floor(minutes/60))+':'+pad(minutes%60);
 }
 const m=String(v).match(/(?:^|\s)(\d{1,2}):(\d{2})(?::\d{2})?/);
 return m?pad(m[1])+':'+m[2]:null;
}
function stampCell(v){
 if(v===null||v===undefined||v==='')return null;
 const date=dateCell(v);
 if(!date)return null;
 return date+'T'+(timeCell(v)||'00:00')+':00';
}
function mins(v){
 if(v===null||v===undefined||v==='')return null;
 if(typeof v==='number')return Number.isFinite(v)?Math.round(v):null;
 const s=String(v).trim().replace(',','.');
 const match=s.match(/^(\d{1,3}):(\d{2})$/);
 if(match)return Number(match[1])*60+Number(match[2]);
 const n=Number(s);
 return Number.isFinite(n)?Math.round(n):null;
}
function parse(buffer){
 if(!window.XLSX?.read||!window.XLSX?.utils?.sheet_to_json)throw Error('Lector Excel no disponible en la aplicación.');
 const book=window.XLSX.read(buffer,{type:'array',cellDates:false});
 if(!book.SheetNames?.length)throw Error('El archivo no contiene hojas.');
 const pages=book.SheetNames.map(name=>{
  const sheet=book.Sheets[name];
  const matrix=window.XLSX.utils.sheet_to_json(sheet,{header:1,raw:true,defval:''});
  const headers=matrix.slice(0,40).map((line,index)=>{
   let matches=0;
   const columns=line.map(x=>{const k=alias.get(norm(x))||null;if(k)matches++;return k});
   return {index,columns,matches};
  }).sort((a,b)=>b.matches-a.matches);
  return {name,matrix,header:headers[0]};
 }).sort((a,b)=>(b.header?.matches||0)-(a.header?.matches||0));
 const candidate=pages.find(p=>p.header?.matches>=2&&p.header.columns.includes('equipo_original'));
 if(!candidate)throw Error('No se reconocieron columnas en las hojas del Excel. Debe incluir Equipo y fecha de inicio o falla.');
 const matrix=candidate.matrix;
 const search=matrix.slice(0,40).map((line,index)=>{
  let matches=0;
  const columns=line.map(x=>{const k=alias.get(norm(x))||null;if(k)matches++;return k});
  return {index,columns,matches};
 }).sort((a,b)=>b.matches-a.matches);
 const header=search[0];
 if(!header||header.matches<2||!header.columns.includes('equipo_original'))throw Error('No se identificaron las columnas del Excel.');
 const rows=[];
 for(let i=header.index+1;i<matrix.length;i++){
  const cells=matrix[i];
  if(!cells||cells.every(c=>String(c??'').trim()===''))continue;
  const r={};
  header.columns.forEach((key,k)=>{if(key)r[key]=cells[k]??''});
  const start=stampCell(r.fecha_hora_falla)||(dateCell(r.fecha_inicio)?dateCell(r.fecha_inicio)+'T'+(timeCell(r.hora_inicio)||'00:00')+':00':null);
  const end=stampCell(r.fecha_hora_restitucion)||(dateCell(r.fecha_termino)?dateCell(r.fecha_termino)+'T'+(timeCell(r.hora_termino)||'00:00')+':00':null);
  const mapped={
   equipo_original:String(r.equipo_original||'').trim(),
   numero_guia:String(r.numero_guia||'').trim()||null,
   supervisor_tecnico:String(r.supervisor_tecnico||'').trim()||null,
   fecha_inicio:start?.slice(0,10)||null,hora_inicio:start?.slice(11,16)||null,
   fecha_termino:end?.slice(0,10)||null,hora_termino:end?.slice(11,16)||null,
   fecha_hora_falla:start,fecha_hora_restitucion:end,
   estado_final:String(r.estado_final||'').trim()||null,
   observaciones:String(r.observaciones||'').trim()||null,
   duracion_minutos:mins(r.duracion_minutos),
   id_falla:String(r.id_falla||'').trim()||null,
   excluir_kpi:/^(si|sí|true|1|yes)$/i.test(String(r.excluir_kpi||'').trim()),
   motivo_exclusion:String(r.motivo_exclusion||'').trim()||null,
   observacion_exclusion:String(r.observacion_exclusion||'').trim()||null
  };
  if(mapped.duracion_minutos===null&&start&&end){
   const delta=(new Date(end)-new Date(start))/60000;
   if(delta>=0&&Number.isFinite(delta))mapped.duracion_minutos=Math.round(delta);
  }
  if(!mapped.equipo_original||!start)throw Error('Fila '+(i+1)+': falta equipo o fecha inicial. Se canceló sin modificar datos.');
  rows.push(mapped);
 }
 if(!rows.length)throw Error('El Excel no contiene averías válidas.');
 if(rows.length>10000)throw Error('Límite de 10.000 registros por importación.');
 return rows;
}
function css(){
 if(document.getElementById('r364-style'))return;
 const el=document.createElement('style');el.id='r364-style';
 el.textContent='.r369-correctivo-import{margin:12px 0;padding:14px;border:1px solid var(--line,#b7cbe0);background:var(--panel,#f7fafc);border-radius:12px;color:var(--text,#15344b)}'+
 '.r369-correctivo-import .r364-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}'+
 '.r369-correctivo-import .r364-button{border:1px solid #176aa7;background:linear-gradient(125deg,#0e619e,#1e83c1);color:white;-webkit-text-fill-color:white;border-radius:9px;padding:10px 13px;font-weight:700;cursor:pointer}'+
 '.r369-correctivo-import .r364-hint{color:var(--muted,#52677e);font-size:12px;margin:8px 0 0}'+
 '.r369-correctivo-import .r369-status{margin-top:9px;white-space:pre-wrap;color:var(--text,#15344b);font-size:13px}';
 document.head.appendChild(el);
}
const pageIds=['page-correctivo','page-confiabilidad'];
function status(message,failed=false){
 for(const node of document.querySelectorAll('.r369-correctivo-import .r369-status')){
  node.textContent=message;node.style.color=failed?'#c33434':'';
 }
}
function mount(){
 css();
 const canImport=allowed();
 for(const pageId of pageIds){
  const page=document.getElementById(pageId);
  const zoneId=id+'-'+pageId;
  if(!page||!canImport){document.getElementById(zoneId)?.remove();continue}
  if(document.getElementById(zoneId))continue;
  const zone=document.createElement('section');zone.id=zoneId;
  zone.className='r369-correctivo-import';
  zone.innerHTML='<div class="r364-actions"><button type="button" class="r364-button" data-r369-start>Importar Excel y reemplazar base de averías</button><input data-r369-file type="file" accept=".xlsx,.xls,.csv" hidden></div>'+
   '<p class="r364-hint">Se revisará el Excel antes de reemplazar. Confirmación doble, respaldo automático y recuperación ante errores.</p>'+
   '<div class="r369-status" role="status" aria-live="polite">Listo para seleccionar archivo.</div>';
  const body=page.querySelector('#corrBody')||page;
  body.prepend(zone);
  zone.querySelector('[data-r369-start]').addEventListener('click',()=>{
   zone.querySelector('[data-r369-file]').click();
  });
  zone.querySelector('[data-r369-file]').addEventListener('change',onFile);
 }
}
async function onFile(event){
 const input=event.target,file=input.files?.[0];if(!file)return;
 try{
  if(file.size>15*1024*1024)throw Error('Archivo superior a 15 MB.');
  status('Leyendo y validando las hojas del Excel…');
  const rows=parse(await file.arrayBuffer());
  const sb=client();if(!sb)throw Error('Sin conexión a la base de datos.');
  const count=await sb.from('averias').select('id',{count:'exact',head:true});
  if(count.error)throw count.error;
  const old=count.count;
  if(!Number.isInteger(old))throw Error('No fue posible comprobar el total de averías actuales.');
  // R368: vista previa obligatoria antes del reemplazo destructivo.
  const muestra=rows.slice(0,5).map((r,i)=>
    (i+1)+'. '+r.equipo_original+' | '+(r.fecha_inicio||'sin fecha')+
    ' | '+(r.numero_guia||'sin guía')).join('\n');
  const fechas=rows.map(r=>r.fecha_inicio).filter(Boolean).sort();
  const periodo=fechas.length?fechas[0]+' a '+fechas[fechas.length-1]:'sin fechas identificadas';
  const summary='REVISIÓN PREVIA DEL REEMPLAZO CORRECTIVO\n\nArchivo: '+file.name+
    '\nRegistros actuales: '+old+
    '\nRegistros en el Excel: '+rows.length+
    '\nPeríodo del Excel: '+periodo+
    '\n\nPrimeros registros:\n'+muestra+
    '\n\nATENCIÓN: se reemplazará TODA la base actual, incluidos registros manuales. Se conservará un respaldo íntegro y la operación se revertirá si falla la importación.\n\n¿Desea continuar?';
  status('Archivo validado: '+rows.length+' averías. Esperando confirmación.');
  if(!window.confirm(summary))return;
  const typed=window.prompt('Para confirmar el reemplazo de TODA la base correctiva, escriba REEMPLAZAR:');
  if(typed!=='REEMPLAZAR'){toast('Importación cancelada; la base no se modificó.');return}
  const button=input.closest('.r369-correctivo-import')?.querySelector('[data-r369-start]');if(button)button.disabled=true;
  status('Reemplazando base y generando respaldo. No cierre esta ventana…');
  try{
   const q=await sb.rpc('reemplazar_averias_excel_r364',{p_filas:rows,p_archivo:file.name,p_cantidad_esperada:old});
   if(q.error)throw q.error;
   const data=q.data||{};
   status('Importación completada: '+data.nuevos+' averías. Respaldo: '+data.respaldo_id);toast('Importación completada: '+data.nuevos+' averías. Respaldo previo generado.','success');
   window.dispatchEvent(new CustomEvent('stainher:correctivo-reemplazado-r364',{detail:data}));
   if(typeof window.renderCorrectivo==='function')await window.renderCorrectivo();
   else if(typeof window.loadAverias==='function')await window.loadAverias();
  }finally{if(button)button.disabled=false}
 }catch(error){status('Error: '+(error.message||error),true);toast('No se reemplazó la base: '+(error.message||error),'error');console.error('[R369] Importación correctiva',error)}
 finally{input.value=''}
}
let installed=false,pending=false;
function install(){
 mount();resolveRole().then(mount);if(installed)return;installed=true;
 new MutationObserver(events=>{
  if(!events.some(e=>e.type==='childList'&&(e.addedNodes.length||e.removedNodes.length)))return;
  if(pending)return;
  pending=true;requestAnimationFrame(()=>{pending=false;mount()});
 }).observe(document.body,{subtree:true,childList:true});
}
window.StainherCorrectivoReplaceR364={install,parse,mount,resolveRole};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();