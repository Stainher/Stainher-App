/* Stainher V15.24 · R157 · Histórico de Presupuestos sin acción Detalle.
 * El detalle esencial ya se muestra en la columna Detalle.
 * Mantiene compatibilidad con instalaciones anteriores limpiando cualquier
 * botón o fila expandida R150 que aún exista en el DOM.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r157-presupuestos-history-no-detail-button';
  if(window.__STAINHER_PRESUPUESTOS_HISTORY_R150__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_HISTORY_R150__=BUILD;

  function cleanup(){
    document.querySelectorAll('#page-contrato [data-r150-detail]').forEach(node=>node.remove());
    document.querySelectorAll('#page-contrato .r150-detail-row').forEach(node=>node.remove());
    return true;
  }

  let queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;cleanup()});
  }

  function install(){
    cleanup();
    const root=document.getElementById('contractContent')||document.getElementById('page-contrato');
    if(root&&!root.dataset.r157NoDetailObserver){
      root.dataset.r157NoDetailObserver='1';
      new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    }
    window.addEventListener('stainher:modules-ready',schedule);
  }

  window.StainherPresupuestosHistoryR150=Object.freeze({install,decorate:cleanup,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
