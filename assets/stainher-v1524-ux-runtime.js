/* Stainher App V15.24 · Capa UX transversal y no invasiva.
 * Mejora navegación, accesibilidad y modales sin redefinir renderizadores.
 */
(function installStainherUxRuntime(){
  'use strict';
  if(window.__STAINHER_UX_RUNTIME__)return;
  window.__STAINHER_UX_RUNTIME__=true;
  const roleLabel=()=>window.v1519RoleLabel?.(window.state?.profile?.rol||'')||window.state?.profile?.rol||'';
  const activePage=()=>document.querySelector('.nav button.active:not(.v11-hidden)');
  function syncNavigation(){
    document.querySelectorAll('.nav button[data-page]').forEach(button=>{
      const active=button===activePage();
      button.setAttribute('aria-current',active?'page':'false');
      if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',(button.textContent||button.dataset.page||'Sección').trim());
    });
    const page=(activePage()?.textContent||'Inicio').trim(),role=roleLabel();
    document.title=`${page} · Stainher App${role?' · '+role:''}`;
  }
  function enhanceModal(){
    const modal=document.querySelector('#modalRoot .modal');
    if(!modal||modal.dataset.uxReady==='1')return;
    modal.dataset.uxReady='1';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    const title=modal.querySelector('h1,h2,h3,h4');
    if(title){if(!title.id)title.id='stainherModalTitle';modal.setAttribute('aria-labelledby',title.id)}
    requestAnimationFrame(()=>modal.querySelector('input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled])')?.focus({preventScroll:true}));
  }
  function enhanceMessages(root=document){
    root.querySelectorAll?.('.v11-toast-fixed:not([role]),.notice.error:not([role])').forEach(item=>{item.setAttribute('role','status');item.setAttribute('aria-live','polite')});
  }
  function homePanelState(key){try{return sessionStorage.getItem(key)!=='closed'}catch(_){return true}}
  function makeHomePanelCollapsible(selector,title,key){
    const panel=document.querySelector(selector);
    if(!panel||panel.tagName==='DETAILS'&&panel.dataset.homeCollapse==='1')return;
    const details=document.createElement('details');details.className=panel.className;details.dataset.homeCollapse='1';details.open=homePanelState(key);
    const summary=document.createElement('summary');summary.className='stainher-home-collapse-summary';summary.innerHTML=`<span>${title}</span><span class="stainher-home-collapse-chevron" aria-hidden="true">⌄</span>`;
    const content=document.createElement('div');content.className='stainher-home-collapse-content';while(panel.firstChild)content.appendChild(panel.firstChild);
    details.append(summary,content);panel.replaceWith(details);
    details.addEventListener('toggle',()=>{try{sessionStorage.setItem(key,details.open?'open':'closed')}catch(_){ }});
  }
  function enhanceHomePanels(){makeHomePanelCollapsible('#page-inicio .v153-home-alert-panel','Alertas y próximos hitos','stainher-home-alerts')}
  function installSkipLink(){if(document.getElementById('stainherSkipLink'))return;const link=document.createElement('a');link.id='stainherSkipLink';link.className='stainher-skip-link';link.href='#appView';link.textContent='Saltar al contenido principal';document.body.prepend(link)}
  function mountStyle(){if(document.getElementById('stainher-ux-runtime-style'))return;const style=document.createElement('style');style.id='stainher-ux-runtime-style';style.textContent=`.stainher-skip-link{position:fixed;left:12px;top:8px;z-index:100000;transform:translateY(-150%);padding:9px 12px;border-radius:8px;background:#fff;color:#111;font-weight:800}.stainher-skip-link:focus{transform:none}`;document.head.appendChild(style)}
  function boot(){mountStyle();installSkipLink();syncNavigation();enhanceModal();enhanceMessages();enhanceHomePanels();document.querySelector('.nav')?.addEventListener('click',()=>requestAnimationFrame(syncNavigation));window.addEventListener('stainher:modules-ready',syncNavigation)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
(()=>{
  'use strict';
  function ensureWeeklyHp(){
    if(window.__STAINHER_WEEKLY_HP_REPORT__||document.getElementById('stainher-v1524-weekly-hp-live'))return;
    const script=document.createElement('script');
    script.id='stainher-v1524-weekly-hp-live';
    script.src='assets/stainher-v1524-weekly-hp-report.js?build=20260914-r48-weekly-hp-loader-fix';
    script.async=false;
    script.addEventListener('error',()=>console.error('No se pudo cargar Reporte Semanal HP.'),{once:true});
    document.head.appendChild(script);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureWeeklyHp,{once:true});else ensureWeeklyHp();
  window.addEventListener('stainher:modules-ready',ensureWeeklyHp);
})();
