/* Stainher App V15.24 · navegación, versión y paneles autoritativos. */
(()=>{
  'use strict';
  if(window.__STAINHER_NAVIGATION_STABILITY__)return;
  window.__STAINHER_NAVIGATION_STABILITY__=true;
  const VERSION='V15.24';
  let activePage='inicio',sequence=0,baseNavigate=null,queued=false;

  function normalizeVersion(root=document){
    root.querySelectorAll?.('.v151-mobile-title small,.v1514-global-meta span:first-child,.version-chip,.v15-version-chip,.v1513-version-meta span:first-child,[data-stainher-version]').forEach(node=>{
      const before=String(node.textContent||''),after=before.replace(/V15\.\d+(?:\.\d+)*/g,VERSION);
      if(after!==before)node.textContent=after;
    });
    document.title=`Stainher App ${VERSION}`;
  }
  function normalizeHome(){
    const page=document.getElementById('page-inicio');if(!page)return;
    const vacation=page.querySelector('#vacationBalanceHome');
    (vacation?.closest('details,.panel')||vacation)?.remove();
    const staffing=page.querySelector('.v1521-home-turn');
    const staffingPanel=staffing?.closest('details')||staffing;
    if(staffingPanel){
      staffingPanel.setAttribute('aria-label','Dotación en turno hoy');
      const summary=staffingPanel.querySelector(':scope>summary .stainher-disclosure-title');
      if(summary&&summary.textContent!=='Dotación en turno hoy')summary.textContent='Dotación en turno hoy';
      staffingPanel.querySelectorAll('h3').forEach(title=>{if(/Personal de turno hoy|Detalles/i.test(title.textContent||''))title.textContent='Dotación en turno hoy'});
    }
    page.querySelectorAll('details').forEach(details=>{
      const title=String(details.querySelector(':scope>summary')?.textContent||'').replace(/\s+/g,' ').trim();
      const content=String(details.querySelector(':scope>.stainher-disclosure-content')?.textContent||'').replace(/\s+/g,' ').trim();
      if(title==='Detalles'&&!content)details.remove();
    });
  }
  function enforcePage(page){
    if(!page||page==='__more')return;
    activePage=page;
    document.querySelectorAll('.page[id^="page-"]').forEach(node=>{
      const selected=node.id===`page-${page}`;
      node.classList.toggle('hidden',!selected);node.hidden=!selected;node.setAttribute('aria-hidden',String(!selected));
    });
    document.querySelectorAll('.nav button[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===page));
    document.querySelectorAll('#v151MobileBottom button[data-v151-page]').forEach(button=>{
      const selected=button.dataset.v151Page===page;
      button.classList.toggle('active',selected);button.setAttribute('aria-current',selected?'page':'false');
    });
    normalizeVersion();normalizeHome();
  }
  async function navigate(page){
    if(!page||page==='__more')return false;
    const token=++sequence;enforcePage(page);
    try{
      const result=typeof baseNavigate==='function'?await baseNavigate(page):false;
      if(token===sequence){enforcePage(page);requestAnimationFrame(()=>token===sequence&&enforcePage(page));setTimeout(()=>token===sequence&&enforcePage(page),150)}
      return result;
    }catch(error){if(token===sequence)enforcePage(page);throw error}
  }
  function installNavigation(){
    const current=window.v1519Navigate;
    if(typeof current==='function'&&current!==navigate)baseNavigate=current;
    window.v1519Navigate=navigate;window.v1518Navigate=navigate;window.gotoPage=navigate;
  }
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;normalizeVersion();normalizeHome();enforcePage(activePage)});
  }
  function boot(){
    installNavigation();activePage=document.querySelector('.nav button.active[data-page]')?.dataset.page||activePage;enforcePage(activePage);
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#v151MobileBottom button[data-v151-page],.nav button[data-page]');
      const page=button?.dataset.v151Page||button?.dataset.page;
      if(!page||page==='__more')return;
      event.preventDefault();event.stopImmediatePropagation();navigate(page);
    },true);
    new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length||record.type==='characterData'))schedule()}).observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('stainher:modules-ready',()=>{installNavigation();enforcePage(activePage)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
