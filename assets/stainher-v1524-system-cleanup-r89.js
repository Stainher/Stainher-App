/* Stainher V15.24 · R89 · limpieza visual de Sistema.
 * Retira paneles técnicos/diagnósticos solicitados sin eliminar su lógica interna.
 * No modifica datos, permisos, login ni otros módulos.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_SYSTEM_CLEANUP_R89__)return;
  window.__STAINHER_SYSTEM_CLEANUP_R89__=true;

  const TARGETS=[
    'auditoría funcional por perfil',
    'diagnóstico de ejecución',
    'diagnóstico modular',
    'administración escalable · cobertura crud'
  ];
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');

  function matchesPanel(panel){
    const head=panel.querySelector(':scope > summary,:scope > h1,:scope > h2,:scope > h3,:scope > h4');
    const text=norm(head?.textContent||'');
    return TARGETS.some(target=>text.startsWith(target));
  }

  function cleanup(){
    const page=document.getElementById('page-sistema');
    if(!page)return false;

    page.querySelectorAll('.stainher-runtime-audit,.stainher-management').forEach(node=>node.remove());
    page.querySelectorAll('details.panel,section.panel,div.panel,article.panel').forEach(panel=>{
      if(matchesPanel(panel))panel.remove();
    });
    return true;
  }

  function install(){
    cleanup();
    const current=window.renderSistema;
    if(typeof current==='function'&&!current.__stainherSystemCleanupR89){
      const wrapped=async function(...args){
        const out=await current.apply(this,args);
        cleanup();
        requestAnimationFrame(cleanup);
        return out;
      };
      wrapped.__stainherSystemCleanupR89=true;
      window.renderSistema=wrapped;
    }
  }

  window.StainherSystemCleanupR89=Object.freeze({install,cleanup});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();cleanup()});
  window.addEventListener('stainher:session-ready',()=>setTimeout(()=>{install();cleanup()},0));
})();
