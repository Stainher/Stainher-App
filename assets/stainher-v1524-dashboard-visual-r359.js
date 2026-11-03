/* R359 · Diseño compartido de indicadores y acciones, sin modificar lógica */
(()=>{
'use strict';
if(window.StainherVisualR359)return;
const ids=['page-inicio','page-preventivo','page-correctivo'];
const patterns={
 'page-inicio':/^(operativos hoy|turno normal|encierro dentro de turno|encierro fuera de turno|suspendidos por encierro)$/i,
 'page-preventivo':/^(total per[ií]odo|por calendarizar|programadas|atrasadas|ejecutadas)$/i,
 'page-correctivo':/^(total per[ií]odo|abiertas|en proceso|cerradas|pendientes)$/i
};
function scan(){
 for(const id of ids){
  const page=document.getElementById(id);if(!page)continue;
  if(id==='page-inicio')page.querySelectorAll('.v1524-home-kpi').forEach(e=>e.classList.add('stainher-r359-kpi'));
  page.querySelectorAll('.grid-kpi>.kpi,.grid-kpi>.mini-stat,.kpi-grid>.kpi').forEach(e=>e.classList.add('stainher-r359-kpi'));
  page.querySelectorAll('small,span,label,div').forEach(e=>{
   const title=String(e.textContent||'').trim().replace(/\s+/g,' ');
   if(title.length>31||!patterns[id].test(title))return;
   let node=e.parentElement;
   for(let k=0;k<3&&node&&node!==page;k++,node=node.parentElement){
    if(node.matches('.kpi,.mini-stat,.v1524-home-kpi,[class*="prev-kpi"],[class*="prev-stat"],[class*="corr-kpi"]')||
       (k>0&&node.querySelector('strong,b')&&node.querySelectorAll('button,table,input,select').length===0&&node.textContent.trim().length<90)){
      node.classList.add('stainher-r359-kpi');break;
    }
   }
  });
  if(id==='page-inicio')continue;
  page.querySelectorAll('button,.btn').forEach(b=>{
   const label=String(b.textContent||'').trim().replace(/^[+↓⬇↑⤴\s]+/,'');
   const primary=/^(actualizar filtros|registrar aver[ií]a|nueva aver[ií]a)$/i.test(label);
   const secondary=/^(informe pdf|informe excel|importar plan matriz|carga masiva)$/i.test(label);
   if(!primary&&!secondary)return;
   b.classList.add('stainher-r359-action',primary?'stainher-r359-primary':'stainher-r359-secondary');
  });
 }
}
function style(){
 if(document.getElementById('stainher-visual-r359'))return;
 const el=document.createElement('style');el.id='stainher-visual-r359';
 el.textContent=[
 'html body :is(#page-inicio,#page-preventivo,#page-correctivo) .stainher-r359-kpi{background:linear-gradient(125deg,#12446e 0%,#186196 55%,#237eaf 100%)!important;background-image:linear-gradient(125deg,#12446e 0%,#186196 55%,#237eaf 100%)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:11px!important;box-shadow:0 4px 13px rgba(15,48,78,.14)!important;min-width:0;box-sizing:border-box}',
 'html body :is(#page-inicio,#page-preventivo,#page-correctivo) .stainher-r359-kpi :is(small,span,b,strong,div,p,label){color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;text-shadow:none!important}',
 'html body :is(#page-inicio,#page-preventivo,#page-correctivo) .stainher-r359-kpi :is(strong,b){font-weight:750!important;font-variant-numeric:tabular-nums}',
 'html body :is(#page-preventivo,#page-correctivo) .stainher-r359-action{min-height:39px!important;border-radius:9px!important;padding:8px 13px!important;font-weight:650!important;box-shadow:0 2px 6px rgba(19,65,105,.11)!important;white-space:normal!important;box-sizing:border-box!important}',
 'html body :is(#page-preventivo,#page-correctivo) .stainher-r359-action.stainher-r359-primary{background:linear-gradient(125deg,#096aab,#167fbf)!important;background-image:linear-gradient(125deg,#096aab,#167fbf)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #166ca9!important}',
 'html body :is(#page-preventivo,#page-correctivo) .stainher-r359-action.stainher-r359-secondary{background:linear-gradient(180deg,#fff,#edf5fb)!important;background-image:linear-gradient(180deg,#fff,#edf5fb)!important;color:#173952!important;-webkit-text-fill-color:#173952!important;border:1px solid #b1c7dc!important}',
 'html[data-theme="dark"] body :is(#page-preventivo,#page-correctivo) .stainher-r359-action.stainher-r359-secondary{background:#23384a!important;background-image:none!important;color:#f2f8ff!important;-webkit-text-fill-color:#f2f8ff!important;border-color:#526f89!important}',
 '@media(max-width:780px){html body :is(#page-inicio,#page-preventivo,#page-correctivo) .stainher-r359-kpi{min-width:0!important}html body :is(#page-preventivo,#page-correctivo) .stainher-r359-action{max-width:100%;min-height:40px!important}}'
 ].join('\n');document.head.appendChild(el);
}
let observing=false,scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan()})}
function install(){
 style();scan();if(observing)return;observing=true;
 const obs=new MutationObserver(events=>{
  if(events.some(m=>m.type==='childList'&&(m.target?.closest?.('#page-inicio,#page-preventivo,#page-correctivo')||[...m.addedNodes].some(n=>n.nodeType===1&&n.matches?.('#page-inicio,#page-preventivo,#page-correctivo')))))schedule();
 });
 obs.observe(document.body,{subtree:true,childList:true});
}
window.StainherVisualR359={install,scan};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('stainher:modules-ready',schedule);
})();