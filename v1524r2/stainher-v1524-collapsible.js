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
  function keyFor(element,title){
    const page=element.closest('.page')?.id||'general';
    const siblings=[...(element.parentElement?.children||[])].filter(x=>x.matches?.(PANEL_SELECTOR));
    return `stainher-disclosure:${page}:${norm(title).toLowerCase()}:${Math.max(0,siblings.indexOf(element))}`;
  }
  function savedOpen(key){
    try{const value=sessionStorage.getItem(key);if(value==='open')return true;if(value==='closed')return false}catch(_){ }
    return !matchMedia('(max-width:760px)').matches;
  }
  function titleNode(element){
    return element.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > h4,:scope > .row-between h1,:scope > .row-between h2,:scope > .row-between h3,:scope > .row-between h4,:scope > header h3,:scope > header h4');
  }
  function titleFor(element){
    if(element.matches('#page-inicio .v153-home-alert-panel'))return 'Alertas y próximos hitos';
    if(element.matches('#page-inicio .v1521-home-turn'))return 'Personal de turno hoy';
    return norm(titleNode(element)?.textContent||element.getAttribute('aria-label'));
  }
  function summary(title){
    const node=document.createElement('summary');node.className='stainher-disclosure-summary';
    node.innerHTML=`<span class="stainher-disclosure-marker" aria-hidden="true"></span><span class="stainher-disclosure-title"></span>`;
    node.querySelector('.stainher-disclosure-title').textContent=title;return node;
  }
  function normalizeExisting(details,title){
    if(details.dataset.stainherDisclosure==='1')return;
    const old=details.querySelector(':scope > summary');if(!old)return;
    const label=title||norm(old.textContent);old.classList.add('stainher-disclosure-summary');
    old.querySelector('.stainher-home-collapse-chevron')?.remove();
    if(!old.querySelector('.stainher-disclosure-marker'))old.prepend(Object.assign(document.createElement('span'),{className:'stainher-disclosure-marker'}));
    const marker=old.querySelector('.stainher-disclosure-marker');if(marker){marker.textContent='';marker.setAttribute('aria-hidden','true')}
    if(!old.querySelector('.stainher-disclosure-title')){
      const text=document.createElement('span');text.className='stainher-disclosure-title';
      const remaining=[...old.childNodes].filter(x=>x!==marker);remaining.forEach(x=>text.appendChild(x));
      if(!norm(text.textContent))text.textContent=label;old.append(text);
    }
    details.dataset.stainherDisclosure='1';
  }
  function convert(element){
    if(!element?.isConnected||element.closest('.modal')||element.dataset.noCollapse==='1')return;
    const title=titleFor(element);if(!title)return;
    if(element.tagName==='DETAILS'){normalizeExisting(element,title);return}
    if(element.dataset.stainherCollapsible==='1')return;
    const details=document.createElement('details');
    details.className=`${element.className} stainher-disclosure`.trim();
    for(const attr of [...element.attributes])if(!['class','open'].includes(attr.name))details.setAttribute(attr.name,attr.value);
    details.dataset.stainherCollapsible='1';details.dataset.stainherDisclosure='1';
    const stateKey=keyFor(element,title);details.open=savedOpen(stateKey);
    const content=document.createElement('div');content.className='stainher-disclosure-content';
    const heading=titleNode(element);if(heading)heading.remove();
    while(element.firstChild)content.appendChild(element.firstChild);
    details.append(summary(title),content);element.replaceWith(details);
    details.addEventListener('toggle',()=>{try{sessionStorage.setItem(stateKey,details.open?'open':'closed')}catch(_){ }});
  }
  function enhance(root=document){
    root.querySelectorAll?.(PANEL_SELECTOR).forEach(convert);
    root.querySelectorAll?.('#appView details:not([data-no-disclosure-marker])').forEach(x=>{if(!x.closest('.modal'))normalizeExisting(x,'')});
  }
  function mountStyle(){
    if(document.getElementById('stainher-collapsible-style'))return;
    const style=document.createElement('style');style.id='stainher-collapsible-style';style.textContent=`
      .stainher-disclosure{overflow:hidden}
      .stainher-disclosure-summary{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;min-height:48px;cursor:pointer;list-style:none;color:var(--text,#fff);font-size:17px;font-weight:800}
      .stainher-disclosure-summary::-webkit-details-marker{display:none}.stainher-disclosure-summary::marker{content:''}
      .stainher-disclosure-marker{display:block!important;width:0!important;height:0!important;flex:0 0 auto!important;border-top:7px solid transparent!important;border-bottom:7px solid transparent!important;border-left:11px solid currentColor!important;color:inherit!important;font-size:0!important;line-height:0!important;transform-origin:38% 50%;transition:transform .18s ease}
      details[open]>.stainher-disclosure-summary>.stainher-disclosure-marker{transform:rotate(90deg)}
      .stainher-disclosure-title{min-width:0;overflow-wrap:anywhere}
      .stainher-disclosure-content{min-width:0;padding-top:12px;border-top:1px solid var(--line,#334155)}
      .stainher-disclosure-content>:first-child{margin-top:0}
      [data-theme="light"] .stainher-disclosure-summary{color:#182230}
      @media(max-width:760px){.stainher-disclosure-summary{font-size:16px;min-height:46px}.stainher-disclosure-content{padding-top:10px}}
      @media(prefers-reduced-motion:reduce){.stainher-disclosure-marker{transition:none}}
    `;document.head.appendChild(style)
  }
  function boot(){
    mountStyle();enhance();let queued=false;
    new MutationObserver(records=>{if(queued)return;if(records.some(r=>r.addedNodes.length)){queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}}).observe(document.body,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>enhance());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
