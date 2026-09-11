/* Stainher V15.24 · Inicio estable y saldo de vacaciones solo en ficha de usuario.
 * Opera únicamente sobre el DOM: no envuelve renderInicio y evita recursión con
 * las capas históricas de layout/navegación.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HOME_VISIBILITY_FIX__)return;
  window.__STAINHER_HOME_VISIBILITY_FIX__=true;

  function normalize(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  }

  function cleanHomeTransientPanels(){
    const page=document.getElementById('page-inicio');
    if(!page)return;
    page.querySelectorAll('#vacationBalanceHome,[data-vacation-balance-home],#v1524PersonalWorkSummary,.v1524-personal-work-summary').forEach(node=>node.remove());
    [...page.querySelectorAll('.panel,details')].forEach(node=>{
      const title=node.querySelector(':scope > summary,:scope > h3,:scope > .row-between h3');
      if(normalize(title?.textContent)==='saldo de vacaciones')node.remove();
    });
  }

  function homeIsVisible(){
    const page=document.getElementById('page-inicio');
    if(!page)return false;
    return !page.classList.contains('hidden')&&page.hidden!==true&&page.getAttribute('aria-hidden')!=='true';
  }

  function setHomeHeaderNow(){
    if(!homeIsVisible())return;
    try{window.v1514SetGlobalHeader?.('inicio')}catch(_){ }
    const mobile=document.getElementById('v151MobileTitle');
    if(mobile&&normalize(mobile.textContent)!=='inicio'&&normalize(mobile.textContent)!=='⌂ inicio')mobile.textContent='⌂ Inicio';
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      cleanHomeTransientPanels();
      if(homeIsVisible())setHomeHeaderNow();
    });
  }

  const style=document.createElement('style');
  style.id='stainher-v1524-home-visibility-fix-style';
  style.textContent=`
    #page-inicio #vacationBalanceHome,
    #page-inicio [data-vacation-balance-home],
    #page-inicio #v1524PersonalWorkSummary,
    #page-inicio .v1524-personal-work-summary{display:none!important}
  `;
  document.head.appendChild(style);

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-page="inicio"],[data-v151-page="inicio"]');
    if(!button)return;
    try{window.v1514SetGlobalHeader?.('inicio')}catch(_){ }
    const mobile=document.getElementById('v151MobileTitle');
    if(mobile)mobile.textContent='⌂ Inicio';
    requestAnimationFrame(schedule);
  },true);

  const root=document.getElementById('appView')||document.body;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  window.addEventListener('stainher:modules-ready',schedule);

  schedule();
  setTimeout(schedule,800);
  setTimeout(schedule,1800);
})();
