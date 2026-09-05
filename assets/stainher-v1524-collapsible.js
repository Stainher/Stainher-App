/* Stainher App V15.24 · patrón desplegable transversal para información secundaria. */
(()=>{
  'use strict';
  if(window.__STAINHER_COLLAPSIBLE__)return;
  window.__STAINHER_COLLAPSIBLE__=true;

  const PANEL_SELECTOR=[
    '.page .panel',
    '#page-inicio .v153-home-alert-panel',
    '#page-inicio .v1521-home-turn',
    '.v1523-prev-equipment-group',
    '.v1523-prev-unplanned-group',
    '.v1519-inventory-details',
    '.stainher-management',
    '.stainher-runtime-audit'
  ].join(',');

  const norm=value=>String(value||'').replace(/\s+/g,' ').trim();
  const pointerLocks=new WeakMap();
  function keyFor(element,title){
    const page=element.closest('.page')?.id||'general';
    const siblings=[...(element.parentElement?.children||[])].filter(x=>x.matches?.(PANEL_SELECTOR));
    return `stainher-disclosure:${page}:${norm(title).toLowerCase()}:${Math.max(0,siblings.indexOf(element))}`;
  }
  function savedOpen(key){
    return false;
  }
  function titleNode(element){
    return element.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > h4,:scope > .row-between h1,:scope > .row-between h2,:scope > .row-between h3,:scope > .row-between h4,:scope > header h3,:scope > header h4');
  }
  function titleFor(element){
    if(element.matches('#page-inicio .v153-home-alert-panel'))return 'Alertas y próximos hitos';
    if(element.matches('#page-inicio .v1521-home-turn'))return 'Dotación en turno hoy';
    return norm(titleNode(element)?.textContent||element.getAttribute('aria-label'));
  }
  function summary(title){
    const node=document.createElement('summary');node.className='stainher-disclosure-summary';
    node.innerHTML=`<span class="stainher-disclosure-marker" aria-hidden="true"></span><span class="stainher-disclosure-title"></span>`;
    node.querySelector('.stainher-disclosure-title').textContent=title;return node;
  }
  function forceStaffingSummary(details){
    const content=norm(details?.textContent);
    if(!details?.matches?.('#page-inicio .v1521-home-turn,#page-inicio .stainher-home-staffing,[data-stainher-home-panel="staffing"]')&&!details?.querySelector?.('.v1521-home-turn,.v1524-home-kpis,.v1524-home-shifts,.stainher-home-staffing,[data-stainher-home-panel="staffing"]')&&!/Dotación en turno hoy|Personal de turno hoy/i.test(content))return false;
    const old=details.querySelector(':scope > summary');if(!old)return false;
    let label=old.querySelector('.stainher-disclosure-title,.stainher-home-collapse-summary>span:not(.stainher-disclosure-marker):not(.stainher-home-collapse-chevron)');
    if(!label){
      label=document.createElement('span');label.className='stainher-disclosure-title';
      [...old.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE&&norm(node.textContent)).forEach(node=>node.remove());
      old.appendChild(label);
    }
    label.classList.add('stainher-disclosure-title');label.textContent='Dotación en turno hoy';
    details.classList.remove('v1521-home-turn');details.classList.add('stainher-home-staffing');
    details.dataset.stainherHomePanel='staffing';details.setAttribute('aria-label','Dotación en turno hoy');
    return true;
  }
  function normalizeExisting(details,title){
    const staffing=forceStaffingSummary(details);
    if(details.dataset.stainherDisclosure==='1')return;
    const old=details.querySelector(':scope > summary');if(!old)return;
    const label=staffing?'Dotación en turno hoy':title||norm(old.textContent);old.classList.add('stainher-disclosure-summary');
    old.querySelector('.stainher-home-collapse-chevron')?.remove();
    if(!old.querySelector('.stainher-disclosure-marker'))old.prepend(Object.assign(document.createElement('span'),{className:'stainher-disclosure-marker'}));
    const marker=old.querySelector('.stainher-disclosure-marker');if(marker){marker.textContent='';marker.setAttribute('aria-hidden','true')}
    if(!old.querySelector('.stainher-disclosure-title')){
      const text=document.createElement('span');text.className='stainher-disclosure-title';
      const remaining=[...old.childNodes].filter(x=>x!==marker);remaining.forEach(x=>text.appendChild(x));
      if(!norm(text.textContent))text.textContent=label;old.append(text);
    }
    details.open=false;
    details.dataset.stainherDisclosure='1';
  }
  function convert(element){
    if(!element?.isConnected||element.closest('.modal')||element.dataset.noCollapse==='1')return;
    if(!element.matches('.v1521-home-turn,.stainher-home-staffing,[data-stainher-home-panel="staffing"]')&&element.querySelector?.('.v1521-home-turn,.stainher-home-staffing,[data-stainher-home-panel="staffing"]'))return;
    const title=titleFor(element);if(!title)return;
    if(element.tagName==='DETAILS'){normalizeExisting(element,title);return}
    if(element.dataset.stainherCollapsible==='1')return;
    const details=document.createElement('details');
    const staffing=element.matches('#page-inicio .v1521-home-turn,#page-inicio .stainher-home-staffing,[data-stainher-home-panel="staffing"]')||/Dotación en turno hoy|Personal de turno hoy/i.test(title);
    const inherited=[...element.classList].filter(name=>!staffing||name!=='v1521-home-turn').join(' ');
    details.className=`${inherited} stainher-disclosure${staffing?' stainher-home-staffing':''}`.trim();
    for(const attr of [...element.attributes])if(!['class','open'].includes(attr.name))details.setAttribute(attr.name,attr.value);
    details.dataset.stainherCollapsible='1';details.dataset.stainherDisclosure='1';
    const stateKey=keyFor(element,title);details.open=savedOpen(stateKey);
    const content=document.createElement('div');content.className='stainher-disclosure-content';
    if(staffing){element.dataset.noCollapse='1';element.dataset.stainherRenderHost='staffing';details.dataset.stainherHomePanel='staffing'}
    else{const heading=titleNode(element);if(heading)heading.remove();while(element.firstChild)content.appendChild(element.firstChild)}
    details.append(summary(title),content);element.replaceWith(details);
    /* Inserta primero el reemplazo y después recupera el host asíncrono dentro
     * del contenido. Moverlo antes invalidaba replaceWith() y eliminaba toda la
     * tarjeta de la página. */
    if(staffing)content.appendChild(element);
    details.addEventListener('toggle',()=>{});
  }
  function ensureDevelopmentCredit(){
    const page=document.getElementById('page-sistema');
    if(!page||page.querySelector('#stainherDevelopmentCredit'))return;
    const details=document.createElement('details');
    details.id='stainherDevelopmentCredit';
    details.className='panel stainher-development-credit';
    details.setAttribute('aria-label','Información de desarrollo');
    details.innerHTML=`<summary>Información de desarrollo</summary><div class="stainher-development-credit-body"><span>Desarrollado por</span><div>Ismael Gálvez</div><span>Fecha de desarrollo</span><div>21-08-2026</div></div>`;
    const changes=[...page.querySelectorAll('details,.panel')].find(node=>/Últimas modificaciones/i.test(norm(node.textContent)));
    if(changes)changes.insertAdjacentElement('afterend',details);
    else page.appendChild(details);
  }
  function enhance(root=document){
    ensureDevelopmentCredit();
    root.querySelectorAll?.(PANEL_SELECTOR).forEach(convert);
    root.querySelectorAll?.('#appView details:not([data-no-disclosure-marker])').forEach(x=>{if(!x.closest('.modal'))normalizeExisting(x,'')});
  }
  function closePageDisclosures(pageId){
    const page=document.getElementById(`page-${pageId}`);if(!page)return;
    page.querySelectorAll('details:not([data-keep-open="1"])').forEach(details=>{details.open=false});
  }
  function authoritativeToggle(event){
    const control=event.target.closest?.('#page-inicio details>summary');
    const details=control?.parentElement;
    if(!control||details?.tagName!=='DETAILS'||event.target.closest('a,button,input,select,textarea'))return;
    event.preventDefault();event.stopImmediatePropagation();
    const lock=pointerLocks.get(details);
    if(lock&&performance.now()<lock.until){details.open=lock.open;return}
    details.open=!details.open;
  }
  function pointerToggle(event){
    if(event.pointerType==='mouse'&&event.button!==0)return;
    const control=event.target.closest?.('#page-inicio details>summary');
    const details=control?.parentElement;
    if(!control||details?.tagName!=='DETAILS'||event.target.closest('a,button,input,select,textarea'))return;
    const open=!details.open;
    pointerLocks.set(details,{open,until:performance.now()+800});
    details.open=open;
  }
  function preservePointerToggle(event){
    const details=event.target;
    if(details?.tagName!=='DETAILS'||!details.closest?.('#page-inicio'))return;
    const lock=pointerLocks.get(details);
    if(lock&&performance.now()<lock.until&&details.open!==lock.open){
      queueMicrotask(()=>{if(details.isConnected)details.open=lock.open});
    }
  }
  function mountStyle(){
    if(document.getElementById('stainher-collapsible-style'))return;
    const style=document.createElement('style');style.id='stainher-collapsible-style';style.textContent=`
      .stainher-disclosure{overflow:hidden}
      .stainher-disclosure-summary{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;min-height:48px;cursor:pointer;list-style:none;color:var(--text,#fff);font-size:17px;font-weight:500!important}
      .stainher-disclosure-summary::-webkit-details-marker{display:none}.stainher-disclosure-summary::marker{content:''}.stainher-disclosure-summary::before{content:none!important;display:none!important}
      .stainher-disclosure-marker{display:block!important;width:0!important;height:0!important;flex:0 0 auto!important;border-top:7px solid transparent!important;border-bottom:7px solid transparent!important;border-left:11px solid currentColor!important;color:inherit!important;font-size:0!important;line-height:0!important;transform-origin:38% 50%;transition:transform .18s ease}
      details[open]>.stainher-disclosure-summary>.stainher-disclosure-marker{transform:rotate(90deg)}
      .stainher-disclosure-title{min-width:0;overflow-wrap:anywhere;font-weight:500!important}
      .stainher-disclosure-content{min-width:0;padding-top:12px;border-top:1px solid var(--line,#334155)}
      .stainher-disclosure-content>:first-child{margin-top:0}
      #page-inicio details.stainher-home-staffing>.stainher-disclosure-content>.v1521-home-turn>h3,
      #page-inicio details.stainher-home-staffing>.stainher-disclosure-content>.v1521-home-turn>.row-between>div>h3{display:none!important}
      .stainher-development-credit-body{display:grid;grid-template-columns:minmax(120px,.7fr) minmax(0,1fr);gap:8px 14px;padding-top:12px;border-top:1px solid var(--line,#334155)}
      .stainher-development-credit-body span{color:var(--muted,#94a3b8)}
      .stainher-development-credit-body div{color:var(--text,#fff);font-weight:400}
      [data-theme="light"] .stainher-disclosure-summary{color:#182230}
      [data-theme="light"] .stainher-development-credit-body div{color:#182230}
      @media(max-width:760px){.stainher-disclosure-summary{font-size:16px;min-height:46px}.stainher-disclosure-content{padding-top:10px}.stainher-development-credit-body{grid-template-columns:1fr;gap:3px}.stainher-development-credit-body div{margin-bottom:8px}}
      @media(prefers-reduced-motion:reduce){.stainher-disclosure-marker{transition:none}}
    `;document.head.appendChild(style)
  }
  function boot(){
    mountStyle();enhance();let queued=false;
    new MutationObserver(records=>{if(queued)return;if(records.some(r=>r.addedNodes.length)){queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}}).observe(document.body,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>enhance());
    /* Control autoritativo del despliegue. Algunas capas históricas de Inicio
     * cancelan el click antes de que Safari ejecute la acción nativa de
     * <summary>; por eso abrimos/cerramos aquí una sola vez y no dependemos de
     * esos listeners heredados. */
    window.addEventListener('pointerup',pointerToggle,true);
    window.addEventListener('toggle',preservePointerToggle,true);
    window.addEventListener('click',authoritativeToggle,true);
    document.addEventListener('click',event=>{
      const control=event.target.closest?.('summary.stainher-disclosure-summary');
      const details=control?.parentElement;
      if(!control||details?.tagName!=='DETAILS'||!details.closest('#appView')||event.target.closest('a,button,input,select,textarea'))return;
      event.preventDefault();event.stopImmediatePropagation();
      details.open=!details.open;
    },true);
    document.addEventListener('click',event=>{
      const control=event.target.closest?.('[data-page]');const pageId=control?.dataset?.page;
      if(pageId)setTimeout(()=>{enhance();closePageDisclosures(pageId)},0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
