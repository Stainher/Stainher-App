/* Stainher V15.24 · R57 · Inicio sin saldo de vacaciones */
(()=>{
  'use strict';
  if(window.__STAINHER_HOME_NO_VACATION_R57__)return;
  window.__STAINHER_HOME_NO_VACATION_R57__=true;
  let queued=false;
  const clean=node=>String(node?.textContent||'').replace(/\s+/g,' ').trim();
  function cleanup(){
    const page=document.getElementById('page-inicio');
    if(!page)return;
    const targets=[];
    const direct=page.querySelector('#vacationBalanceHome');
    if(direct)targets.push(direct.closest('details,.panel')||direct);
    [...page.children].forEach(node=>{
      if(node.matches?.('details,.panel')&&/Saldo de vacaciones|Saldo vigente después de solicitudes aprobadas/i.test(clean(node)))targets.push(node);
    });
    [...new Set(targets)].forEach(node=>node?.remove());
  }
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;cleanup()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});else cleanup();
  new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length||r.type==='characterData'))schedule()}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('stainher:modules-ready',cleanup);
})();
