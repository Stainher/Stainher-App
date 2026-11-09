/* R361 · Reparación Nuevo recordatorio / alerta en Inicio */
(()=>{
'use strict';
if(window.StainherReminderR361)return;
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const notify=(s,type)=>window.toast?.(s,type)||console.info('[Recordatorios]',s);
let saving=false;
const previewBlocked=()=>window.v15MutationBlocked?.();
function style(){
 if(document.getElementById('stainher-reminder-r361-style'))return;
 const sheet=document.createElement('style');sheet.id='stainher-reminder-r361-style';
 sheet.textContent=[
 '#stainher-reminder-r361{position:fixed;inset:0;z-index:2147481000;background:rgba(9,24,39,.65);display:grid;place-items:center;padding:15px;box-sizing:border-box}',
 '#stainher-reminder-r361[hidden]{display:none!important}',
 '#stainher-reminder-r361 .r361-dialog{width:min(560px,100%);max-height:min(90vh,750px);overflow:auto;background:var(--panel,#f8fbff);border:1px solid #94aec6;border-radius:16px;box-shadow:0 18px 70px rgba(0,0,0,.3);color:var(--text,#163450);padding:20px;box-sizing:border-box}',
 '#stainher-reminder-r361 .r361-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:0 0 12px}',
 '#stainher-reminder-r361 .r361-head h2{font-size:21px;margin:0;color:var(--text,#163450)}',
 '#stainher-reminder-r361 .r361-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
 '#stainher-reminder-r361 .r361-form label{display:grid;gap:5px;min-width:0;color:var(--text,#17364f);font-size:13px}',
 '#stainher-reminder-r361 .r361-form label.wide{grid-column:1/-1}',
 '#stainher-reminder-r361 .r361-form :is(input,select,textarea){min-width:0;max-width:100%;width:100%;padding:10px;box-sizing:border-box;border:1px solid #a5bdd3;border-radius:9px;background:#fff!important;color:#19364e!important;-webkit-text-fill-color:#19364e!important;font-size:15px}',
 '#stainher-reminder-r361 .r361-form textarea{min-height:86px;resize:vertical}',
 '#stainher-reminder-r361 .r361-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}',
 '#stainher-reminder-r361 button{cursor:pointer;border:1px solid #adc3d8;border-radius:9px;padding:10px 15px;min-height:42px;background:#fff;color:#123a59}',
 '#stainher-reminder-r361 .r361-save{background:linear-gradient(125deg,#0769a6,#217fc2)!important;color:#fff!important;border-color:#126bae!important}',
 '#stainher-reminder-r361 .r361-error{grid-column:1/-1;color:#bd3030;font-size:13px}',
 '@media(max-width:520px){#stainher-reminder-r361{align-items:start;padding:10px}#stainher-reminder-r361 .r361-dialog{padding:15px;margin-top:12px;max-height:calc(100dvh - 30px)}#stainher-reminder-r361 .r361-form{grid-template-columns:1fr}#stainher-reminder-r361 .r361-form label.wide{grid-column:auto}}'
 ].join('\n');document.head.appendChild(sheet);
}
function close(){
 if(saving)return;
 const root=document.getElementById('stainher-reminder-r361');
 if(root)root.remove();document.removeEventListener('keydown',escapeKey,true);
}
function escapeKey(e){if(e.key==='Escape'){e.preventDefault();close()}}
function open(){
 if(previewBlocked()){notify('Modo prueba: las acciones de escritura están bloqueadas.','warn');return}
 style();if(document.getElementById('stainher-reminder-r361'))return;
 const overlay=document.createElement('div');overlay.id='stainher-reminder-r361';overlay.setAttribute('role','presentation');
 overlay.innerHTML='<div class="r361-dialog" role="dialog" aria-modal="true" aria-labelledby="r361-title">'+
 '<div class="r361-head"><h2 id="r361-title">Nuevo recordatorio / alerta</h2><button type="button" data-r361-close aria-label="Cerrar formulario">✕</button></div>'+
 '<form class="r361-form" id="r361-form">'+
 '<label class="wide">Título<input name="titulo" maxlength="160" required autofocus placeholder="Asunto del recordatorio"></label>'+
 '<label>Fecha del evento<input type="date" name="fecha_evento" value="'+today()+'" required></label>'+
 '<label>Tipo<select name="tipo"><option value="recordatorio">Recordatorio</option><option value="alerta">Alerta</option><option value="hito">Hito</option></select></label>'+
 '<label>Prioridad<select name="prioridad"><option value="normal">Normal</option><option value="importante">Importante</option><option value="critica">Crítica</option></select></label>'+
 '<label>Visibilidad<select name="visibilidad"><option value="todos">Todos los usuarios</option><option value="personal">Solo yo</option><option value="administrador">Administración</option></select></label>'+
 '<label class="wide">Descripción<textarea name="descripcion" maxlength="2000" placeholder="Información adicional (opcional)"></textarea></label>'+
 '<div class="r361-error" role="alert" hidden></div>'+
 '<div class="r361-actions"><button type="button" data-r361-close>Cancelar</button><button class="r361-save" type="submit">Guardar recordatorio</button></div>'+
 '</form></div>';
 document.body.appendChild(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('[data-r361-close]'))close()});
 overlay.querySelector('form').addEventListener('submit',save);
 document.addEventListener('keydown',escapeKey,true);
 overlay.querySelector('[name="titulo"]')?.focus();
}
async function save(e){
 e.preventDefault();
 if(saving)return;
 const form=e.currentTarget,submit=form.querySelector('[type="submit"]'),err=form.querySelector('.r361-error');
 const fd=new FormData(form),title=String(fd.get('titulo')||'').trim(),date=String(fd.get('fecha_evento')||'');
 if(title.length<3||! /^\d{4}-\d{2}-\d{2}$/.test(date)){err.hidden=false;err.textContent='Ingrese un título y una fecha válidos.';return}
 const client=typeof sb==='undefined'?window.sb:sb;
 if(previewBlocked()){err.hidden=false;err.textContent='Modo prueba: las acciones de escritura están bloqueadas.';return}
 if(!client?.rpc){err.hidden=false;err.textContent='La sesión no está disponible.';return}
 saving=true;submit.disabled=true;err.hidden=true;
 let id;
 try{
  const {data,error}=await client.rpc('crear_recordatorio_v153',{
   p_titulo:title,p_descripcion:String(fd.get('descripcion')||'').trim()||null,
   p_fecha_evento:date,p_tipo:String(fd.get('tipo')),p_prioridad:String(fd.get('prioridad')),
   p_visibilidad:String(fd.get('visibilidad'))
  });
  if(error)throw error;
  id=data;
 }catch(error){
  err.hidden=false;err.textContent='No se pudo guardar: '+(error.message||'Error desconocido');return;
 }finally{saving=false;submit.disabled=false}
 close();notify('Recordatorio / alerta creado correctamente.','success');
 try{
  if(typeof window.renderHomeAlertsV95==='function')await window.renderHomeAlertsV95();
  else if(typeof window.renderInicio==='function')await window.renderInicio();
  window.dispatchEvent(new CustomEvent('stainher:reminder-created-r361',{detail:{id}}));
 }catch(error){console.warn('[R361] Guardado correctamente; visualización diferida',error)}
}
window.StainherReminderR361=Object.freeze({open,close});
})();
