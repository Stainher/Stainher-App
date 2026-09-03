/* Stainher App V15.24 · arranque visual estable en Inicio.
 * Este bloque se ejecuta desde config.js antes del primer renderizado visible.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_INITIAL_ROUTE_GUARD__)return;
  window.__STAINHER_INITIAL_ROUTE_GUARD__=true;

  const style=document.createElement('style');
  style.id='stainher-initial-route-guard-style';
  style.textContent=`
    @media(max-width:900px){
      html:not([data-stainher-initial-route-ready="1"]) #appView .page,
      html:not([data-stainher-initial-route-ready="1"]) #v151MobileTitle,
      html:not([data-stainher-initial-route-ready="1"]) .v151-mobile-title small{
        visibility:hidden!important
      }
    }
  `;
  document.head.appendChild(style);

  let observer,completed=false;
  function activateInicio(){
    if(completed)return true;
    if(!window.matchMedia?.('(max-width:900px)').matches){
      completed=true;
      observer?.disconnect();
      document.documentElement.dataset.stainherInitialRouteReady='1';
      return true;
    }
    const page=document.getElementById('page-inicio');
    const title=document.getElementById('v151MobileTitle');
    if(!page||!title)return false;

    /* Detener antes de modificar el DOM: cambiar el título también genera una
     * mutación y Safari podía encadenar el observador indefinidamente. */
    completed=true;
    observer?.disconnect();

    document.querySelectorAll('.page[id^="page-"]').forEach(node=>{
      const selected=node===page;
      node.classList.toggle('hidden',!selected);
      node.hidden=!selected;
      node.setAttribute('aria-hidden',String(!selected));
    });
    document.querySelectorAll('.nav button[data-page]').forEach(button=>{
      button.classList.toggle('active',button.dataset.page==='inicio');
    });
    document.querySelectorAll('#v151MobileBottom button[data-v151-page]').forEach(button=>{
      const selected=button.dataset.v151Page==='inicio';
      button.classList.toggle('active',selected);
      button.setAttribute('aria-current',selected?'page':'false');
    });
    if(title.textContent!=='⌂ Inicio')title.textContent='⌂ Inicio';
    const version=title.closest('.v151-mobile-title')?.querySelector('small');
    if(version)version.textContent='Stainher App · V15.24';

    requestAnimationFrame(()=>{
      document.documentElement.dataset.stainherInitialRouteReady='1';
    });
    return true;
  }

  observer=new MutationObserver(activateInicio);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(!activateInicio())document.addEventListener('DOMContentLoaded',activateInicio,{once:true});
  setTimeout(()=>{
    completed=true;
    document.documentElement.dataset.stainherInitialRouteReady='1';
    observer?.disconnect();
  },2500);
})();
