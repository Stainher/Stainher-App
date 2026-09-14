/* Stainher V15.24 · R65 · Reporte Semanal HP dentro de Turnos y Novedades.
 * El reporte deja de ser una ruta visible independiente y se presenta como
 * tercera pestaña del renderer autoritativo de Turnos (r18).
 * No modifica login/sesión ni instala interceptores globales.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_INSIDE_TURNOS_R65__)return;
  window.__STAINHER_HP_INSIDE_TURNOS_R65__=true;

  const PAGE_ID='reporte-hp';
  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  let hpRendering=false;

  const norm=v=>String(v||'').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'_');
  const role=()=>norm(window.v11Role?.()||window.state?.profile?.rol||window.state?.user?.rol||window.currentProfile?.rol||'');
  const canView=()=>VIEW_ROLES.has(role());

  function mountStyle(){
    if(document.getElementById('stainher-hp-inside-turnos-r65-style'))return;
    const style=document.createElement('style');
    style.id='stainher-hp-inside-turnos-r65-style';
    style.textContent=`
      #page-turnos .r18-turn-tabs [data-r18-tab="hp"]{white-space:nowrap}
      #page-turnos.r65-hp-active .r18-turn-meta,
      #page-turnos.r65-hp-active .r18-turn-actions,
      #page-turnos.r65-hp-active .r18-turn-toolbar,
      #page-turnos.r65-hp-active .r18-kpis{display:none!important}
      #page-turnos [data-r18-content] > #page-reporte-hp{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box}
      @media(max-width:700px){#page-turnos .r18-turn-tabs{overflow-x:auto;max-width:100%;padding-bottom:2px}}
    `;
    document.head.appendChild(style);
  }

  function cleanupLegacyRoute(){
    let changed=false;
    document.querySelectorAll(`.nav [data-page="${PAGE_ID}"]`).forEach(btn=>{btn.remove();changed=true});
    const standalone=document.getElementById(`page-${PAGE_ID}`);
    if(standalone&&!standalone.closest('#page-turnos [data-r18-content]')){standalone.remove();changed=true}
    try{if(typeof V1518_MODULES==='object'&&V1518_MODULES&&Object.prototype.hasOwnProperty.call(V1518_MODULES,PAGE_ID)){delete V1518_MODULES[PAGE_ID];changed=true}}catch(_e){}
    if(changed){
      try{window.v1519BuildMobileNav?.()}catch(_e){}
      try{window.v151UpdateMobileNav?.()}catch(_e){}
    }
  }

  function resolveHpRenderer(){
    try{
      const renderer=typeof window.v1523Renderer==='function'?window.v1523Renderer(PAGE_ID):null;
      return typeof renderer==='function'?renderer:null;
    }catch(error){
      console.error('[Stainher HP R65] No fue posible resolver el renderer HP.',error);
      return null;
    }
  }

  async function renderHpInto(content){
    if(!content||hpRendering)return;
    hpRendering=true;
    try{
      content.innerHTML=`<section id="page-${PAGE_ID}"><div class="empty">Cargando Reporte Semanal HP…</div></section>`;
      const renderer=resolveHpRenderer();
      if(!renderer){
        content.innerHTML='<div class="notice error">Reporte Semanal HP no está disponible. Recarga la aplicación e inténtalo nuevamente.</div>';
        return;
      }
      await renderer();
    }catch(error){
      console.error('[Stainher HP R65] Render dentro de Turnos.',error);
      content.innerHTML=`<div class="notice error">No fue posible cargar Reporte Semanal HP: ${String(error?.message||error||'Error desconocido')}</div>`;
    }finally{
      hpRendering=false;
    }
  }

  function bindHpTab(page,tabs,button,content){
    if(button.dataset.r65Bound==='1')return;
    button.dataset.r65Bound='1';
    button.addEventListener('click',event=>{
      event.preventDefault();
      if(!canView())return;
      window.state=window.state||{};
      window.state.v1520TurnTab='hp';
      tabs.querySelectorAll('[data-r18-tab]').forEach(tab=>tab.classList.toggle('active',tab===button));
      page.classList.add('r65-hp-active');
      renderHpInto(content);
    });
  }

  function enhanceTurnos(){
    cleanupLegacyRoute();
    const page=document.getElementById('page-turnos');
    if(!page)return;
    installTurnosObserver(page);
    const tabs=page.querySelector('.r18-turn-tabs');
    const content=page.querySelector('[data-r18-content]');
    if(!tabs||!content)return;

    let hp=tabs.querySelector('[data-r18-tab="hp"]');
    if(!canView()){
      hp?.remove();
      page.classList.remove('r65-hp-active');
      if(window.state?.v1520TurnTab==='hp')window.state.v1520TurnTab='malla';
      return;
    }

    if(!hp){
      hp=document.createElement('button');
      hp.type='button';
      hp.className='btn';
      hp.dataset.r18Tab='hp';
      hp.textContent='Reporte Semanal HP';
      tabs.appendChild(hp);
    }
    bindHpTab(page,tabs,hp,content);

    const active=window.state?.v1520TurnTab==='hp';
    hp.classList.toggle('active',active);
    page.classList.toggle('r65-hp-active',active);
    if(active){
      tabs.querySelectorAll('[data-r18-tab]').forEach(tab=>tab.classList.toggle('active',tab===hp));
      if(!content.querySelector(`#page-${PAGE_ID}`))renderHpInto(content);
    }
  }

  function installTurnosObserver(page){
    if(page.__stainherHpR65Observer)return;
    const observer=new MutationObserver(()=>{
      if(hpRendering)return;
      queueMicrotask(enhanceTurnos);
    });
    // Solo observa reemplazos directos del contenido de page-turnos. No vigila
    // document/body ni los cambios internos del propio reporte HP.
    observer.observe(page,{childList:true,subtree:false});
    page.__stainherHpR65Observer=observer;
  }

  function boot(){
    mountStyle();
    cleanupLegacyRoute();
    enhanceTurnos();
    window.addEventListener('stainher:modules-ready',enhanceTurnos);
    window.addEventListener('stainher:profile-ready',enhanceTurnos);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
