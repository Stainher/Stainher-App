/* Stainher V15.24 · R54 · visibilidad, rol y navegación robusta para Reporte Semanal HP */
(()=>{
  'use strict';
  if(window.__STAINHER_WEEKLY_HP_ROLE_FIX__) return;
  window.__STAINHER_WEEKLY_HP_ROLE_FIX__=true;

  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const norm=v=>String(v||'').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'_');
  const currentRole=()=>norm(window.v11Role?.() || window.state?.profile?.rol || window.state?.user?.rol || window.currentProfile?.rol || '');

  function syncResolvedRole(r){
    if(!r||!window.state)return;
    const current=norm(window.state?.profile?.rol||'');
    if(current)return;
    window.state.profile={...(window.state.profile||{}),rol:r};
  }

  function bindNavigation(btn){
    if(!btn||btn.dataset.hpNavFix==='1')return;
    btn.dataset.hpNavFix='1';
    btn.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const handler=btn.onclick;
      if(typeof handler==='function')handler.call(btn,event);
    },true);
  }

  function apply(){
    const btn=document.querySelector('.nav [data-page="reporte-hp"]');
    if(!btn) return false;
    const r=currentRole();
    if(!r) return false;
    syncResolvedRole(r);
    const visible=VIEW_ROLES.has(r);
    btn.classList.toggle('v11-hidden',!visible);
    btn.hidden=!visible;
    btn.style.display=visible?'':'none';
    if(visible)bindNavigation(btn);
    return visible;
  }

  let tries=0;
  (function retry(){
    apply();
    if(++tries<80) setTimeout(retry,250);
  })();
  window.addEventListener('stainher:modules-ready',apply);
  window.addEventListener('stainher:profile-ready',apply);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
})();
