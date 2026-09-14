/* Stainher V15.24 · R52 · visibilidad robusta Reporte Semanal HP */
(()=>{
  'use strict';
  if(window.__STAINHER_WEEKLY_HP_ROLE_FIX__) return;
  window.__STAINHER_WEEKLY_HP_ROLE_FIX__=true;

  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const norm=v=>String(v||'').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'_');
  const currentRole=()=>norm(window.v11Role?.() || window.state?.profile?.rol || window.state?.user?.rol || window.currentProfile?.rol || '');

  function apply(){
    const btn=document.querySelector('.nav [data-page="reporte-hp"]');
    if(!btn) return false;
    const r=currentRole();
    if(!r) return false;
    const visible=VIEW_ROLES.has(r);
    btn.classList.toggle('v11-hidden',!visible);
    btn.hidden=!visible;
    btn.style.display=visible?'':'none';
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
