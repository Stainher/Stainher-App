/* Stainher V15.24 · R60 · Reporte Semanal HP estable por rol y navegación */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_ROUTER_R60__)return;
  window.__STAINHER_HP_ROUTER_R60__=true;

  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
  const resolveRole=()=>norm(window.v11Role?.()||window.state?.profile?.rol||window.state?.user?.rol||window.currentProfile?.rol||'');
  let opening=false,repairing=false;

  function syncAuthorizedRole(){
    const r=resolveRole();
    if(!VIEW_ROLES.has(r))return '';
    window.state=window.state||{};
    window.state.profile=window.state.profile||{};
    /* El módulo HP original valida state.profile.rol literalmente. Mantener aquí
       el valor autoritativo normalizado evita que variantes como "Administrador "
       autooculten el reporte después de abrir. */
    if(window.state.profile.rol!==r)window.state.profile.rol=r;
    return r;
  }

  function refreshVisibility(){
    const btn=document.querySelector('.nav [data-page="reporte-hp"]');
    if(!btn)return false;
    const r=syncAuthorizedRole();
    const visible=VIEW_ROLES.has(r);
    repairing=true;
    try{
      btn.hidden=!visible;
      btn.classList.toggle('v11-hidden',!visible);
      btn.style.display=visible?'':'none';
      if(visible)btn.removeAttribute('aria-hidden');
    }finally{repairing=false}
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
    if(opening||!refreshVisibility())return;
    const original=typeof btn.onclick==='function'?btn.onclick:null;
    if(!original)return;
    opening=true;
    try{
      /* gotoPage actualiza activePage antes de su primer await. No esperar la
         Promise evita la reentrada que congelaba R57. */
      try{
        const pending=typeof window.gotoPage==='function'?window.gotoPage('reporte-hp'):null;
        if(pending&&typeof pending.catch==='function')pending.catch(err=>console.warn('[Stainher HP R60] navegación base',err));
      }catch(err){console.warn('[Stainher HP R60] registro de ruta',err)}
      syncAuthorizedRole();
      original.call(btn);
      stabilizePage(btn);
      requestAnimationFrame(()=>{syncAuthorizedRole();stabilizePage(btn)});
      setTimeout(()=>{syncAuthorizedRole();refreshVisibility();stabilizePage(btn)},200);
      setTimeout(()=>{syncAuthorizedRole();refreshVisibility();stabilizePage(btn)},700);
    }catch(err){
      console.error('[Stainher HP R60] Error al abrir Reporte Semanal HP',err);
    }finally{
      setTimeout(()=>{opening=false},300);
    }
  }

  window.addEventListener('click',event=>{
    const btn=event.target?.closest?.('.nav [data-page="reporte-hp"]');
    if(!btn)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    openHp(btn);
  },true);

  let tries=0;
  (function retry(){syncAuthorizedRole();refreshVisibility();if(++tries<120)setTimeout(retry,250)})();
  window.addEventListener('stainher:modules-ready',()=>{syncAuthorizedRole();refreshVisibility()});
  window.addEventListener('stainher:profile-ready',()=>{syncAuthorizedRole();refreshVisibility()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncAuthorizedRole();refreshVisibility()}});

  new MutationObserver(records=>{
    if(repairing)return;
    const relevant=records.some(r=>r.target?.matches?.('.nav [data-page="reporte-hp"]')||r.target?.closest?.('.nav [data-page="reporte-hp"]'));
    if(relevant)queueMicrotask(()=>{syncAuthorizedRole();refreshVisibility()});
  }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
})();
