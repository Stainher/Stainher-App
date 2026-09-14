/* Stainher V15.24 · R59 · integración estable Reporte Semanal HP */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_ROUTER_R59__)return;
  window.__STAINHER_HP_ROUTER_R59__=true;

  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
  const role=()=>norm(window.v11Role?.()||window.state?.profile?.rol||window.state?.user?.rol||window.currentProfile?.rol||'');
  let opening=false;

  function syncRole(r){
    if(!r)return;
    window.state=window.state||{};
    window.state.profile=window.state.profile||{};
    if(!window.state.profile.rol)window.state.profile.rol=r;
  }

  function refreshVisibility(){
    const btn=document.querySelector('.nav [data-page="reporte-hp"]');
    if(!btn)return false;
    const r=role();
    if(!r)return false;
    syncRole(r);
    const visible=VIEW_ROLES.has(r);
    btn.hidden=!visible;
    btn.classList.toggle('v11-hidden',!visible);
    btn.style.display=visible?'':'none';
    return visible;
  }

  function stabilizePage(btn){
    const page=document.getElementById('page-reporte-hp');
    if(!page)return;
    document.querySelectorAll('.page[id^="page-"]').forEach(node=>{
      const selected=node===page;
      node.classList.toggle('hidden',!selected);
      node.hidden=!selected;
      node.setAttribute('aria-hidden',String(!selected));
    });
    document.querySelectorAll('.nav button[data-page]').forEach(node=>node.classList.toggle('active',node===btn));
    const title=document.getElementById('v151MobileTitle');
    if(title)title.textContent='▦ Reporte Semanal HP';
  }

  function openHp(btn){
    if(opening)return;
    const r=role();
    if(!VIEW_ROLES.has(r))return;
    syncRole(r);
    const original=typeof btn.onclick==='function'?btn.onclick:null;
    if(!original)return;

    opening=true;
    try{
      try{
        const pending=typeof window.gotoPage==='function'?window.gotoPage('reporte-hp'):null;
        if(pending&&typeof pending.catch==='function')pending.catch(err=>console.warn('[Stainher HP R59] Navegación base no resolvió reporte-hp',err));
      }catch(err){
        console.warn('[Stainher HP R59] No fue posible registrar reporte-hp en el router',err);
      }
      original.call(btn);
      stabilizePage(btn);
      requestAnimationFrame(()=>stabilizePage(btn));
      setTimeout(()=>stabilizePage(btn),180);
    }catch(err){
      console.error('[Stainher HP R59] Error al abrir Reporte Semanal HP',err);
    }finally{
      setTimeout(()=>{opening=false;},250);
    }
  }

  window.addEventListener('click',event=>{
    const btn=event.target?.closest?.('.nav [data-page="reporte-hp"]');
    if(!btn)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openHp(btn);
  },true);

  let tries=0;
  (function retry(){
    refreshVisibility();
    if(++tries<80)setTimeout(retry,250);
  })();
  window.addEventListener('stainher:modules-ready',refreshVisibility);
  window.addEventListener('stainher:profile-ready',refreshVisibility);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshVisibility()});
})();
