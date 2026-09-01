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
  function installSkipLink(){
    if(document.getElementById('stainherSkipLink'))return;
    const link=document.createElement('a');link.id='stainherSkipLink';link.className='stainher-skip-link';link.href='#appView';link.textContent='Saltar al contenido principal';document.body.prepend(link);
  }
  function mountStyle(){
    if(document.getElementById('stainher-ux-runtime-style'))return;
    const style=document.createElement('style');style.id='stainher-ux-runtime-style';style.textContent=`
      .stainher-skip-link{position:fixed;left:12px;top:8px;z-index:100000;transform:translateY(-150%);padding:9px 12px;border-radius:8px;background:#fff;color:#111;font-weight:800}.stainher-skip-link:focus{transform:none}
      :where(button,a,input,select,textarea):focus-visible{outline:2px solid #93c5fd!important;outline-offset:2px!important}
      @media(max-width:700px){.btn{min-height:42px}.v154-request-actions .btn,.v1523-page-actions .btn{width:100%}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
    `;document.head.appendChild(style);
  }
  function boot(){
    mountStyle();installSkipLink();syncNavigation();enhanceModal();enhanceMessages();
    document.querySelector('.nav')?.addEventListener('click',()=>requestAnimationFrame(syncNavigation));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('#modalRoot .modal')&&typeof window.closeModal==='function')window.closeModal()});
    new MutationObserver(records=>{let nav=false,modal=false;for(const record of records){if(record.target.closest?.('.nav')||record.target.classList?.contains('nav'))nav=true;if(record.target.closest?.('#modalRoot')||record.target.id==='modalRoot')modal=true;enhanceMessages(record.target)}if(nav)syncNavigation();if(modal)enhanceModal()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('stainher:modules-ready',syncNavigation);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
