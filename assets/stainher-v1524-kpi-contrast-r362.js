/* R362: KPI completos y contrastados en módulos reales. */
(()=>{
'use strict';
if(window.StainherSummaryFixR362)return;
const gradient='linear-gradient(125deg,#12446e 0%,#1a6094 52%,#287eb3 100%)';
const labels=/^(?:total(?: del mes| per[ií]odo| rendido| neto acumulado| actividades)?|valor vigente|cobrado neto|estados de pago|veh[ií]culos activos|dotaci[oó]n contractual|dotaci[oó]n visible|activos|vacantes|documentos\s*(?:<|≤|menos de)\s*60 d[ií]as|documentos|detalle neto|reconocido edp|edp registrados|por calendarizar|programadas|atrasadas|ejecutadas|programados|realizados|pendientes|vencidos|cumplimiento|ejecuciones libres|operativos hoy|turno normal|encierro dentro de turno|encierro fuera de turno|suspendidos por encierro|equipos|aver[ií]as|preventivos|abiertas|en proceso|cerradas|saldo|pendiente al personal|devuelto al personal|reintegrado|pendiente de reintegro|realizadas|no realizadas|avance global)$/i;
const known='.kpi,.mini-stat,.v1512-mini-kpi,.v1520-kpi,.v1524-home-kpi,.v158-review-kpi,.system-stat,.usage-stat,.supabase-stat,.r342-kpi,.r354-kpi,.stainher-leadership-kpi-r214,.stainher-r359-kpi,.stainher-unified-kpi-r360';
const ignore='.modal,#modalRoot,[role="dialog"],.tooltip,.popover,table,thead,tbody,tr,td,th,form';
const clean=t=>String(t||'').replace(/\s+/g,' ').trim();
const isLabel=el=>!el.children.length&&clean(el.textContent).length<45&&labels.test(clean(el.textContent));
function countLabels(el){
 let count=isLabel(el)?1:0;
 el.querySelectorAll('small,span,label,div,p').forEach(x=>{if(isLabel(x))count++});
 return count;
}
function valid(el){
 if(!(el instanceof HTMLElement)||el.closest(ignore)||el.matches('button,input,select,textarea,summary'))return false;
 if(el.querySelector('table,form,textarea,select,input,button'))return false;
 const t=clean(el.textContent);
 return t.length>1&&t.length<220&&/\d/.test(t)&&countLabels(el)===1;
}
function nearestCard(label){
 let node=label.parentElement,selected=null;
 for(let i=0;i<5&&node&&!node.matches('.page,#app,main,body');i++,node=node.parentElement){
  if(!valid(node))break;
  selected=node;
  if(/kpi|stat|metric|tile|counter|summary|card|box/i.test(String(node.className||'')))break;
 }
 return selected;
}
function style(){
 if(document.getElementById('stainher-kpi-r362'))return;
 const tag=document.createElement('style');tag.id='stainher-kpi-r362';
 tag.textContent=[
 'html body #page-estandarizacion .std-kpi{background:linear-gradient(125deg,#12446e,#1a6094 52%,#287eb3)!important;background-image:linear-gradient(125deg,#12446e,#1a6094 52%,#287eb3)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid rgba(255,255,255,.2)!important;border-radius:12px!important}',
 'html body #page-estandarizacion .std-kpi :is(span,strong,small,div){color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important}',
 'html body #page-estandarizacion .std-kpi .std-progress{background:rgba(255,255,255,.27)!important}',
 'html body #page-liderazgo .v1512-mini-kpi,html body #page-liderazgo .stainher-leadership-kpi-r214{background:linear-gradient(125deg,#12446e,#287eb3)!important;background-image:linear-gradient(125deg,#12446e,#287eb3)!important;color:#fff!important;-webkit-text-fill-color:#fff!important}',
 'html body #page-liderazgo .v1512-mini-kpi :is(span,small,b,strong),html body #page-liderazgo .stainher-leadership-kpi-r214 :is(span,small,b,strong){color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important}',

 'html body .stainher-kpi-card-r362{background:'+gradient+'!important;background-image:'+gradient+'!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid rgba(255,255,255,.17)!important;border-radius:12px!important;box-shadow:0 5px 14px rgba(13,49,82,.16)!important;min-width:0;box-sizing:border-box;opacity:1!important}',
 'html body .stainher-kpi-card-r362 :is(div,span,small,p,label,b,strong,h3,h4,h5,[class*="value"],[class*="number"],[class*="label"]){color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;text-shadow:none!important;background-color:transparent!important}',
 'html body .stainher-kpi-card-r362 :is(b,strong,[class*="value"],[class*="number"]){font-weight:750!important;font-variant-numeric:tabular-nums}',
 'html body .stainher-kpi-card-r362 :is([class*="value"],[class*="number"]){background-image:none!important;border:0!important;box-shadow:none!important}',
 '@media(max-width:780px){html body .stainher-kpi-card-r362{min-width:0!important;max-width:100%!important}}'
 ].join('\n');document.head.appendChild(tag);
}
function paint(el){
 el.classList.add('stainher-kpi-card-r362');
 for(const [prop,value] of [['background',gradient],['background-image',gradient],['color','#fff'],['-webkit-text-fill-color','#fff'],['border-radius','12px']]){
  el.style.setProperty(prop,value,'important');
 }
 el.querySelectorAll('*').forEach(ch=>{
  if(ch.closest(ignore)||ch.matches('button,input,select,svg,path'))return;
  ch.style.setProperty('color','#fff','important');
  ch.style.setProperty('-webkit-text-fill-color','#fff','important');
  ch.style.setProperty('opacity','1','important');
  if(ch.classList.contains('stainher-r359-kpi')||ch.classList.contains('stainher-unified-kpi-r360')){
   ch.classList.remove('stainher-r359-kpi','stainher-unified-kpi-r360');
  }
 });
}
function apply(){
 const root=document.getElementById('app')||document.body;
 const cards=new Set();
 root.querySelectorAll('small,span,label,div,p').forEach(label=>{
  if(!isLabel(label)||label.closest(ignore))return;
  const card=nearestCard(label);if(card)cards.add(card);
 });
 root.querySelectorAll('#page-liderazgo .v1512-mini-kpi,#page-liderazgo .stainher-leadership-kpi-r214,#page-estandarizacion .std-kpi,#page-estandarizacion .kpi,#page-estandarizacion .mini-stat,#page-estandarizacion [class*="stat-card"],#page-estandarizacion [class*="kpi-card"],#page-contrato .v1520-kpi').forEach(el=>{
  if(!el.querySelector('table,canvas,form,button')&&/\d/.test(clean(el.textContent)))cards.add(el);
 });
 root.querySelectorAll(known).forEach(el=>{
  if(!valid(el))return;
  const parent=el.parentElement;
  if(parent&&valid(parent))cards.add(parent);
  else cards.add(el);
 });
 root.querySelectorAll('.stainher-r359-kpi,.stainher-unified-kpi-r360').forEach(el=>{
  if(!cards.has(el)&&(countLabels(el)>1||[...cards].some(card=>el.contains(card)||card.contains(el)))){
   el.classList.remove('stainher-r359-kpi','stainher-unified-kpi-r360');
  }
 });
 [...cards].filter(card=>![...cards].some(other=>other!==card&&other.contains(card))).forEach(paint);
}
let scheduled=false,installed=false;
function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
function install(){
 style();apply();
 if(installed)return;installed=true;
 new MutationObserver(events=>{
  if(events.some(e=>e.type==='childList'&&(e.addedNodes.length||e.removedNodes.length)))queue();
 }).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('stainher:modules-ready',queue);
 window.addEventListener('stainher:navigation',queue);
}
window.StainherSummaryFixR362={install,apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();