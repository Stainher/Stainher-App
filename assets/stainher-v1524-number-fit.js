/* Stainher App V15.24 · escala numérica uniforme y adaptable en todos los módulos. */
(()=>{
  'use strict';
  if(window.__STAINHER_NUMBER_FIT__)return;
  window.__STAINHER_NUMBER_FIT__=true;
  const CARD_SELECTOR='.kpi,.mini-stat,.contract-card,.v151-dot-kpi,.v1512-mini-kpi,.v15-summary-card,.v1520-kpi,.v1520-contract-card,.v1523-user-card,.home-kpi,.system-stat,.storage-card,.latest-ep-card,.forecast-month-summary-v8>*,.forecast-history-summary-v92>*,.reimb-kpis>*,.v158-review-kpi,.stainher-account-vacation';
  const tracked=new WeakSet();
  const numeric=value=>/^(?:\$\s*)?[\d.,]+(?:\s*(?:%|dias?|días?|h|horas?|meses?))?$/.test(String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase());
  function availableWidth(element){
    const parent=element.parentElement;if(!parent)return 0;
    const style=getComputedStyle(parent);return Math.max(40,parent.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0));
  }
  function fit(element){
    if(!element?.isConnected)return;
    const available=availableWidth(element);if(!available)return;
    let size=matchMedia('(max-width:760px)').matches?24:28;
    element.style.setProperty('font-size',size+'px','important');
    while(size>15&&element.scrollWidth>available){size-=.5;element.style.setProperty('font-size',size+'px','important')}
    if(element.scrollWidth>available)element.style.setProperty('font-size','15px','important');
  }
  function candidates(root=document){
    const cards=[];if(root.matches?.(CARD_SELECTOR))cards.push(root);root.querySelectorAll?.(CARD_SELECTOR).forEach(card=>cards.push(card));
    return cards.flatMap(card=>[...card.querySelectorAll('strong,b,.contract-kpi,.storage-value,.latest-ep-value')]).filter(element=>!element.children.length&&numeric(element.textContent));
  }
  function enhance(root=document){
    candidates(root).forEach(element=>{
      element.classList.add('stainher-number-value');fit(element);
      if(!tracked.has(element)){tracked.add(element);try{new ResizeObserver(()=>fit(element)).observe(element.parentElement)}catch(_){ }}
    });
  }
  function mountStyle(){
    if(document.getElementById('stainher-number-fit-style'))return;
    const style=document.createElement('style');style.id='stainher-number-fit-style';style.textContent=`
      .stainher-number-value{display:block!important;max-width:100%!important;line-height:1.08!important;letter-spacing:-.025em!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;font-variant-numeric:tabular-nums!important}
    `;document.head.appendChild(style);
  }
  function boot(){
    mountStyle();enhance();let queued=false;
    new MutationObserver(records=>{if(queued||!records.some(record=>record.addedNodes.length||record.type==='characterData'))return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}).observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',()=>enhance(),{passive:true});
    window.addEventListener('stainher:modules-ready',()=>enhance());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
