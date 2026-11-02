/* R327 — Garantía de contraste del informe de Confiabilidad.
   Corrige estilos heredados y posteriores, sin modificar cálculos ni PDF. */
(()=>{
'use strict';
if(window.__STAINHER_RELIABILITY_CONTRAST_R327__)return;
window.__STAINHER_RELIABILITY_CONTRAST_R327__=true;
const STYLE_ID='stainher-reliability-contrast-r327';
const css=`
#modalRoot .v158-review-modal .v158-review-kpi,
#modalRoot .v158-review-modal .v158-review-block,
#modalRoot .v158-review-modal .v158-review-note{
  background:#eaf3fb!important;background-color:#eaf3fb!important;
  color:#17344f!important;border-color:#aec7db!important;
}
#modalRoot .v158-review-modal .v158-review-kpi :is(small,b,strong,span),
#modalRoot .v158-review-modal .v158-review-block :is(h3,h4,h5,label,small,strong,span),
#modalRoot .v158-review-modal .v158-review-note{
  color:#17344f!important;-webkit-text-fill-color:#17344f!important;
  opacity:1!important;text-shadow:none!important;
}
#modalRoot .v158-review-modal .v158-review-block textarea,
#modalRoot .v158-review-modal .v158-review-block input,
#modalRoot .v158-review-modal .v158-review-block select{
  background:#fff!important;color:#17344f!important;-webkit-text-fill-color:#17344f!important;
}
#modalRoot .v158-review-modal .v158-review-kpi b{font-weight:750!important}
#modalRoot .v158-review-modal .v158-review-actions{background:transparent!important}
`;
function insertStyle(){
 let el=document.getElementById(STYLE_ID);
 if(!el){el=document.createElement('style');el.id=STYLE_ID;el.textContent=css;document.head.append(el)}
 else if(document.head.lastElementChild!==el)document.head.append(el);
}
function set(node,prop,val){
 if(node.style.getPropertyValue(prop)!==val||node.style.getPropertyPriority(prop)!=='important')
 node.style.setProperty(prop,val,'important');
}
function apply(){
 const root=document.querySelector('#modalRoot .v158-review-modal');
 if(!root)return;
 insertStyle();
 root.querySelectorAll('.v158-review-kpi,.v158-review-block,.v158-review-note').forEach(node=>{
  set(node,'background-color','#eaf3fb');set(node,'color','#17344f');set(node,'border-color','#aec7db');
  node.querySelectorAll('h3,h4,h5,label,small,b,strong,span').forEach(text=>{
   set(text,'color','#17344f');set(text,'-webkit-text-fill-color','#17344f');
   set(text,'opacity','1');
  });
 });
 root.querySelectorAll('.v158-review-block textarea').forEach(node=>{
  set(node,'background-color','#fff');set(node,'color','#17344f');
 });
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
function start(){
 insertStyle();apply();
 const modal=document.getElementById('modalRoot');
 if(modal)new MutationObserver(schedule).observe(modal,{childList:true,subtree:true});
 document.addEventListener('click',schedule,true);
 window.addEventListener('stainher:runtime-r119-ready',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.StainherReliabilityContrastR327={apply};
})();