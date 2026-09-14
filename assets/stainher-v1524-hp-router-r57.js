/* Stainher V15.24 · R64 · integración visual Reporte Semanal HP.
 * La navegación sigue perteneciendo al router central v1519/v1523.
 * Esta capa solo alinea la página HP con el contenedor real de módulos y
 * registra su cabecera global. Sin captura de clicks, reintentos,
 * MutationObserver ni lógica de sesión/login. */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LAYOUT_R64__)return;
  window.__STAINHER_HP_LAYOUT_R64__=true;

  const PAGE_ID='reporte-hp';
  const HEADER=[
    'Reporte Semanal HP',
    'Horas administrativas y operativas según cortes semanales informados por Codelco.'
  ];

  function alignHpPage(){
    try{
      if(typeof V1514_HEADERS==='object'&&V1514_HEADERS)V1514_HEADERS[PAGE_ID]=HEADER;
    }catch(error){console.warn('[Stainher HP R64] Cabecera HP',error)}

    const main=document.querySelector('#appView .main');
    const page=document.getElementById(`page-${PAGE_ID}`);
    if(main&&page&&page.parentElement!==main)main.appendChild(page);
    if(page){
      page.style.width='100%';
      page.style.maxWidth='100%';
      page.style.minWidth='0';
      page.style.boxSizing='border-box';
    }

    const active=document.querySelector(`.nav button.active[data-page="${PAGE_ID}"]`);
    if(active){
      try{if(typeof v1514SetGlobalHeader==='function')v1514SetGlobalHeader(PAGE_ID)}catch(error){console.warn('[Stainher HP R64] Encabezado HP',error)}
    }
  }

  function boot(){
    alignHpPage();
    window.addEventListener('stainher:modules-ready',alignHpPage);
    window.addEventListener('stainher:profile-ready',alignHpPage);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
