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
  function enhanceHomePanels(){
    makeHomePanelCollapsible('#page-inicio .v153-home-alert-panel','Alertas y próximos hitos','stainher-home-alerts');
    /* La dotación se convierte en la capa autoritativa, que conserva el host durante consultas asíncronas. */
  }
  function installSkipLink(){
    if(document.getElementById('stainherSkipLink'))return;
    const link=document.createElement('a');link.id='stainherSkipLink';link.className='stainher-skip-link';link.href='#appView';link.textContent='Saltar al contenido principal';document.body.prepend(link);
  }
  function mountStyle(){
    if(document.getElementById('stainher-ux-runtime-style'))return;
    const style=document.createElement('style');style.id='stainher-ux-runtime-style';style.textContent=`
      .stainher-skip-link{position:fixed;left:12px;top:8px;z-index:100000;transform:translateY(-150%);padding:9px 12px;border-radius:8px;background:#fff;color:#111;font-weight:800}.stainher-skip-link:focus{transform:none}
      .stainher-home-collapse-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:2px 0;cursor:pointer;list-style:none;color:var(--text,#fff);font-size:17px;font-weight:800}
      .stainher-home-collapse-summary::-webkit-details-marker{display:none}
      .stainher-home-collapse-summary::marker{content:''}
      .stainher-home-collapse-chevron{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border:1px solid var(--line,#334155);border-radius:9px;color:var(--muted,#9ca3af);font-size:22px;line-height:1;transition:transform .18s ease}
      details[open]>.stainher-home-collapse-summary .stainher-home-collapse-chevron{transform:rotate(180deg)}
      .stainher-home-collapse-content{min-width:0;padding-top:12px;border-top:1px solid var(--line,#334155)}
      .stainher-home-collapse-content .v153-home-head h3,.stainher-home-collapse-content>.row-between h3{display:none}
      /* Dotación responde al ancho útil del contenido, incluido el zoom del navegador. */
      #page-dotacion .v157-group-grid,#page-dotacion .v157-secondary-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,520px),1fr))!important}
      #page-dotacion .v157-group{container-type:inline-size;min-width:0;max-width:100%;overflow:hidden}
      #page-dotacion .v157-group-head,#page-dotacion .v157-group-body,#page-dotacion .v157-person,#page-dotacion .v157-person-detail,#page-dotacion .v157-doc-list{min-width:0;max-width:100%;box-sizing:border-box}
      #page-dotacion .v157-doc{grid-template-columns:minmax(0,1.35fr) minmax(105px,.75fr) minmax(112px,.8fr);gap:12px;min-width:0;max-width:100%;box-sizing:border-box}
      #page-dotacion .v157-doc>*{min-width:0;max-width:100%;box-sizing:border-box}
      #page-dotacion .v157-doc-meta{min-width:0;padding-left:0}
      #page-dotacion .v157-doc-meta :is(b,.status){max-width:100%;white-space:normal;overflow-wrap:anywhere}
      @container (max-width:680px){
        #page-dotacion .v157-doc{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
        #page-dotacion .v157-doc-name{grid-column:1/-1}
      }
      @container (max-width:390px){
        #page-dotacion .v157-group-head{align-items:flex-start;flex-direction:column}
        #page-dotacion .v157-doc{grid-template-columns:minmax(0,1fr)!important}
        #page-dotacion .v157-doc-name{grid-column:auto}
      }
      :where(button,a,input,select,textarea):focus-visible{outline:2px solid #93c5fd!important;outline-offset:2px!important}
      @media(max-width:700px){.btn{min-height:42px}.v154-request-actions .btn,.v1523-page-actions .btn{width:100%}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
    `;document.head.appendChild(style);
  }
  function boot(){
    mountStyle();installSkipLink();syncNavigation();enhanceModal();enhanceMessages();enhanceHomePanels();
    document.querySelector('.nav')?.addEventListener('click',()=>requestAnimationFrame(syncNavigation));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('#modalRoot .modal')&&typeof window.closeModal==='function')window.closeModal()});
    new MutationObserver(records=>{let nav=false,modal=false,home=false;for(const record of records){if(record.target.closest?.('.nav')||record.target.classList?.contains('nav'))nav=true;if(record.target.closest?.('#modalRoot')||record.target.id==='modalRoot')modal=true;if(record.target.closest?.('#page-inicio')||record.target.id==='page-inicio')home=true;enhanceMessages(record.target)}if(nav)syncNavigation();if(modal)enhanceModal();if(home)enhanceHomePanels()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('stainher:modules-ready',syncNavigation);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

