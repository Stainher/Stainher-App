/* R360 · Tarjetas de resumen uniformes para toda Stainher App.
 * Solo estiliza indicadores; no cambia datos, vistas, formularios ni permisos.
 */
(()=>{
'use strict';
if(window.StainherUnifiedSummaryR360)return;
const KNOWN=[
 '.kpi','.mini-stat','.v1512-mini-kpi','.v1520-kpi',
 '.v1524-home-kpi','.v151-dot-kpi','.v1514-import-stat',
 '.system-stat','.usage-stat','.supabase-stat',
 '.stainher-leadership-kpi-r214','.v158-review-kpi',
 '.r342-kpi','.r354-kpi','.home-kpi',
 '.stainher-r359-kpi','.std-dashboard-r144 .kpi'
].join(',');
const exclude=':is(.modal,#modalRoot,[role="dialog"],.popover,.tooltip,[class*="status"],[class*="badge"])';
const maybeNumber=/[$€£]?\s*-?\d[\d.,]*(?:\s*%|\s*(?:CLP|HH|h|min|d[ií]as))?/i;
const labelHint=/total|pendiente|saldo|gasto|reintegrad|devuelto|per[ií]odo|programad|atrasad|ejecutad|abiert|cerrad|confiabilidad|disponibilidad|operativ|turno|encierro|suspendid|hora|falla|reembols|consumid|por calendarizar|cantidad|mes|vacacion|incidencia|vencim|retrasad|avance|cumplim|dotaci[oó]n/i;
function valid(node){
 if(!(node instanceof HTMLElement)||node.matches(exclude)||node.closest('.modal,#modalRoot,[role="dialog"],.popover,.tooltip'))return false;
 if(node.matches('button,input,select,textarea,table,tbody,tr,td,th,summary'))return false;
 if(node.querySelector('input,select,textarea,table,form,button:not([disabled])'))return false;
 const content=String(node.textContent||'').replace(/\s+/g,' ').trim();
 if(!content||content.length>240||!maybeNumber.test(content))return false;
 const selector=String(node.className||'');
 // Generic cards are accepted only if they contain a label plus a metric.
 if((node.matches('.kpi,.mini-stat,.system-stat,.usage-stat,.supabase-stat'))&&
    !labelHint.test(content)&&!node.querySelector('small,strong,b,[class*="value"],[class*="number"]'))return false;
 if(node.querySelectorAll(':scope > .kpi,:scope > .mini-stat,:scope > [class$="-kpi"]').length)return false;
 return true;
}
function candidates(root){
 const set=new Set(root.querySelectorAll(KNOWN));
 // Other implementations use specifically named KPI or metric tiles.
 root.querySelectorAll('[class*="kpi"],[class*="stat"]').forEach(n=>{
  if(n.matches('[class*="kpis"],[class*="stats"],[class*="statistics"],[class*="status"],[class*="label"],[class*="chart"],[class*="grid"],[class*="row"],[class*="wrap"],[class*="header"],[class*="title"],[class*="table"],[class*="input"]'))return;
  if(/\b(?:[\w-]*kpi(?:-[\w-]+)?|[\w-]*stat(?:-[\w-]+)?)\b/i.test(n.className||''))set.add(n);
 });
 return set;
}
function apply(){
 const root=document.getElementById('app')||document.body;
 for(const node of candidates(root)){
  if(valid(node))node.classList.add('stainher-unified-kpi-r360');
  else node.classList.remove('stainher-unified-kpi-r360');
 }
}
function style(){
 if(document.getElementById('stainher-unified-summary-r360-style'))return;
 const tag=document.createElement('style');tag.id='stainher-unified-summary-r360-style';
 tag.textContent=[
 'html body .stainher-unified-kpi-r360{background:linear-gradient(125deg,#12446e 0%,#1a6094 52%,#287eb3 100%)!important;background-image:linear-gradient(125deg,#12446e 0%,#1a6094 52%,#287eb3 100%)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:12px!important;box-shadow:0 5px 14px rgba(14,45,76,.14)!important;min-width:0;box-sizing:border-box;opacity:1!important}',
 'html body .stainher-unified-kpi-r360 :is(small,span,strong,b,p,label,[class*="label"],[class*="value"],[class*="number"],[class*="amount"]){color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;text-shadow:none!important}',
 'html body .stainher-unified-kpi-r360 :is(strong,b,[class*="value"],[class*="number"],[class*="amount"]){font-weight:750!important;font-variant-numeric:tabular-nums}',
 'html body .stainher-unified-kpi-r360 :is(svg,svg path,svg circle){color:#eaf5ff!important;stroke:currentColor}',
 '@media(max-width:780px){html body .stainher-unified-kpi-r360{min-width:0!important;max-width:100%;overflow-wrap:anywhere}}'
 ].join('\n');
 document.head.appendChild(tag);
}
let installed=false,queued=false,observer;
function queue(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;apply()});
}
function install(){
 style();apply();
 if(installed)return;installed=true;
 observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'&&
      (m.addedNodes.length||m.removedNodes.length)))queue();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('stainher:modules-ready',queue);
 window.addEventListener('stainher:navigation',queue);
}
window.StainherUnifiedSummaryR360={install,apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();