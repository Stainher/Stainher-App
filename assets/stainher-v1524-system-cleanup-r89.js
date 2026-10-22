/* Stainher V15.24 · R190 · limpieza definitiva de Sistema.
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
    'administración escalable · cobertura crud',
    'últimas modificaciones',
    'ultimas modificaciones',
    'dotación en turno hoy',
    'dotacion en turno hoy'
  ];
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');

  if(!document.getElementById('stainher-system-r190-style')){
    const style=document.createElement('style');
    style.id='stainher-system-r190-style';
    style.textContent=`
      #page-sistema:not(.stainher-system-r190-ready) details.panel:first-of-type,
      #page-sistema:not(.stainher-system-r190-ready) section.panel:first-of-type{
        visibility:hidden!important;
      }
    `;
    document.head.appendChild(style);
  }

  function matchesPanel(panel){
    const head=panel.querySelector(':scope > summary,:scope > h1,:scope > h2,:scope > h3,:scope > h4');
    const headText=norm(head?.textContent||'');
    const fullText=norm(panel.textContent||'');
    return TARGETS.some(target=>headText.startsWith(target)||fullText.startsWith(target));
  }

  function cleanup(){
    const page=document.getElementById('page-sistema');
    if(!page)return false;

    page.querySelectorAll('.stainher-runtime-audit,.stainher-management').forEach(node=>node.remove());
    page.querySelectorAll('details.panel,section.panel,div.panel,article.panel,details,section,article').forEach(panel=>{
      if(matchesPanel(panel))panel.remove();
    });

    // Seguridad adicional: elimina cualquier bloque residual cuyo encabezado cambie
    // dinámicamente de "Últimas modificaciones" a "Dotación en turno hoy".
    [...page.children].forEach(node=>{
      const text=norm(node.textContent||'');
      if(TARGETS.some(target=>text.startsWith(target)))node.remove();
    });

    page.classList.add('stainher-system-r190-ready');
    return true;
  }

  function install(){
    cleanup();
    const current=window.renderSistema;
    if(typeof current==='function'&&!current.__stainherSystemCleanupR190){
      const wrapped=async function(...args){
        const page=document.getElementById('page-sistema');
        if(page)page.classList.remove('stainher-system-r190-ready');
        const out=await current.apply(this,args);
        cleanup();
        requestAnimationFrame(cleanup);
        setTimeout(cleanup,40);
        setTimeout(cleanup,140);
        return out;
      };
      wrapped.__stainherSystemCleanupR190=true;
      wrapped.__base=current;
      window.renderSistema=wrapped;
      try{renderSistema=wrapped}catch(_){}
    }
  }

  window.StainherSystemCleanupR89=Object.freeze({install,cleanup});
  window.StainherSystemCleanupR190=window.StainherSystemCleanupR89;
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();cleanup()});
  window.addEventListener('stainher:session-ready',()=>setTimeout(()=>{install();cleanup()},0));
})();
