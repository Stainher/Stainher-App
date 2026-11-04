/* R370 · Corregir importador consolidado: actualizar observaciones de fallas ya existentes */
(()=>{
'use strict';
if(window.StainherObservacionesR370)return;
const SEL='[data-r370-update-observaciones]';
const cssId='r370-style';
let busy=false,scheduled=false;
const sb=()=>window.sb;
const show=(message,error=false)=>{
  document.querySelectorAll('[data-r370-status]').forEach(n=>{
    n.textContent=message;
    n.style.color=error?'#bb3030':'';
  });
  if(error)window.toast?.(message,'error');
};
function style(){
 if(document.getElementById(cssId))return;
 const e=document.createElement('style');e.id=cssId;
 e.textContent=[
  '.r370-update-button{border:1px solid #1674a9!important;background:linear-gradient(125deg,#1168a6,#1683bd)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-radius:9px!important;cursor:pointer!important;min-height:42px!important;padding:9px 13px!important;font-weight:650!important}',
  '.r370-update-button:disabled{opacity:.55!important;cursor:wait!important}',
  '[data-r370-status]{display:block;font-size:12px;color:var(--text,#26415e);margin-top:8px;white-space:pre-wrap;max-width:100%}'
 ].join('\n');document.head.appendChild(e);
}
function matchesModal(){
 // El importador R19 ya detecta la identidad y cuenta los duplicados.
 // Se agrega esta opción en su propio diálogo, sin cambiar su flujo de altas.
 const headings=[...document.querySelectorAll('h1,h2,h3,h4,strong')];
 return headings.filter(x=>/^\s*Importar base de aver[ií]as\s*$/i.test(x.textContent||''))
 .map(h=>{
  let node=h;
  for(let i=0;i<7&&node;i++,node=node.parentElement){
   if(node.querySelector?.('input[type="file"]')&&
      /importar\s+\d+\s+registros/i.test(node.textContent||''))return node;
  }
  return null;
 }).filter(Boolean);
}
function putButton(root){
 if(root.querySelector(SEL))return;
 const input=root.querySelector('input[type="file"]');if(!input)return;
 const original=[...root.querySelectorAll('button')].find(b=>/importar\s+\d+\s+registros/i.test(b.textContent||''));
 if(!original)return;
 const b=document.createElement('button');b.type='button';b.className='r370-update-button';
 b.setAttribute('data-r370-update-observaciones','1');
 b.textContent='Actualizar observaciones de fallas existentes';
 const hint=document.createElement('small');hint.setAttribute('data-r370-status','1');
 hint.textContent='Detecta cambios en Observaciones aunque el importador clasifique las fallas como duplicadas. No crea ni elimina averías.';
 original.insertAdjacentElement('afterend',b);b.insertAdjacentElement('afterend',hint);
 b.addEventListener('click',()=>run(input,b));
}
function mount(){
 style();
 matchesModal().forEach(putButton);
 // Alternativa independiente dentro de la tarjeta de importación R369.
 document.querySelectorAll('.r369-correctivo-import').forEach(box=>{
  if(box.querySelector(SEL))return;
  const input=box.querySelector('[data-r369-file]');
  const original=box.querySelector('[data-r369-start]');
  if(!input||!original)return;
  const b=document.createElement('button');b.type='button';b.className='r370-update-button';
  b.setAttribute('data-r370-update-observaciones','1');b.textContent='Actualizar solo observaciones existentes';
  original.insertAdjacentElement('afterend',b);
  b.addEventListener('click',()=>{
   if(input.files?.length)run(input,b);else{
    const onChange=()=>{input.removeEventListener('change',onChange);if(input.files?.length)run(input,b)};
    input.addEventListener('change',onChange,{once:true});input.click();
   }
  });
 });
}
async function run(input,button){
 if(busy)return;
 const file=input.files?.[0];
 if(!file){show('Seleccione un archivo Excel o CSV con Observaciones.',true);return}
 busy=true;button.disabled=true;
 try{
  if(!window.XLSX?.read)throw Error('La biblioteca Excel no está disponible.');
  const parser=window.StainherCorrectivoReplaceR364?.parse;
  if(typeof parser!=='function')throw Error('El lector de averías R369 no está disponible; actualice la aplicación.');
  show('Revisando las fallas del archivo sin modificar la base…');
  const rows=parser(await file.arrayBuffer());
  if(rows.some(r=>!String(r.observaciones||'').trim()))
   throw Error('El archivo contiene filas sin observaciones. No se realizarán cambios para evitar borrar información.');
  const args={p_filas:rows,p_archivo:file.name,p_confirmar:false};
  const preview=await sb().rpc('actualizar_observaciones_averias_r370',args);
  if(preview.error)throw preview.error;
  const data=preview.data;
  const details=(data.ejemplos||[]).slice(0,5).map((r,i)=>
   '\n'+(i+1)+'. '+r.equipo+' · '+r.fecha+
   '\n  Antes: '+r.antes+'\n  Después: '+r.despues).join('\n');
  const summary='ACTUALIZAR OBSERVACIONES DE AVERÍAS EXISTENTES\n\n'+
   'Archivo: '+file.name+
   '\nLeídas: '+data.total+
   '\nObservaciones modificadas: '+data.actualizados+
   '\nSin cambios: '+data.sin_cambios+
   '\nNo encontradas: '+data.sin_coincidencia+
   '\nCoincidencias ambiguas: '+data.ambiguos+
   '\nFilas inválidas: '+data.invalidos+
   '\n\nMuestra de modificaciones:'+details+
   '\n\nNo se crearán ni eliminarán averías.';
  show('Vista previa: '+data.actualizados+' observaciones modificadas, '+data.sin_cambios+' sin cambios, '+data.sin_coincidencia+' sin coincidencia.');
  if(data.sin_coincidencia||data.ambiguos||data.invalidos)
   throw Error('No se puede confirmar una actualización incompleta.\n'+summary+'\nRevise las filas indicadas por el diagnóstico.');
  if(!data.actualizados){show('Todos los registros coincidentes ya tienen las mismas observaciones; no hay cambios por aplicar.');return}
  if(!window.confirm(summary+'\n\n¿Confirma actualizar únicamente Observaciones?'))return;
  if(window.prompt('Para confirmar '+data.actualizados+' cambios, escriba ACTUALIZAR:')!=='ACTUALIZAR'){
   show('Actualización cancelada; la base no se modificó.');return;
  }
  show('Guardando las observaciones modificadas y su auditoría…');
  const result=await sb().rpc('actualizar_observaciones_averias_r370',{...args,p_confirmar:true});
  if(result.error)throw result.error;
  show('Actualización completada: '+result.data.actualizados+' observaciones corregidas, '+result.data.sin_cambios+' registros sin cambios.');
  window.toast?.('Se actualizaron '+result.data.actualizados+' observaciones de fallas existentes.','success');
  window.dispatchEvent(new CustomEvent('stainher:correctivo-observaciones-actualizadas-r370',{detail:result.data}));
  if(typeof window.renderCorrectivo==='function')await window.renderCorrectivo();
 }catch(error){
  console.error('[R370] Observaciones Correctivo',error);
  show('No se modificó la base: '+(error.message||String(error)),true);
 }finally{busy=false;button.disabled=false}
}
function install(){
 style();mount();
 if(window.__stainherR370Observer)return;
 window.__stainherR370Observer=true;
 new MutationObserver(mutations=>{
  if(!mutations.some(m=>m.addedNodes.length||m.removedNodes.length)||scheduled)return;
  scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()});
 }).observe(document.body,{childList:true,subtree:true});
}
window.StainherObservacionesR370={install,mount,run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();