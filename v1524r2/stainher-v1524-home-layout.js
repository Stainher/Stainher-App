/* Stainher App V15.24 · orden de Inicio y saldo personal en Mi cuenta. */
(()=>{
  'use strict';
  if(window.__STAINHER_HOME_LAYOUT__)return;
  window.__STAINHER_HOME_LAYOUT__=true;

  const escHtml=value=>typeof window.esc==='function'?window.esc(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function directPanel(page,selector){
    const node=page.querySelector(selector);
    return node?.closest('details')||node;
  }
  function directChild(page,node){
    let current=node;
    while(current&&current.parentElement!==page)current=current.parentElement;
    return current||node;
  }
  function cleanText(node){return String(node?.textContent||'').replace(/\s+/g,' ').trim()}
  function topPanels(page){
    return [...page.children].filter(node=>node.matches?.('details,.panel')||node.querySelector?.(':scope > details,:scope > .panel'));
  }
  function isAlert(panel){return panel?.matches?.('.v153-home-alert-panel')||panel?.querySelector?.('.v153-home-alert-panel')}
  function isVacation(panel){return /Saldo de vacaciones|Saldo vigente después de solicitudes aprobadas/i.test(cleanText(panel))}
  function findStaffing(page){
    const identified=directPanel(page,'[data-stainher-home-panel="staffing"],.stainher-home-staffing,.v1521-home-turn');
    if(identified)return directChild(page,identified);
    const panels=topPanels(page).filter(panel=>!isAlert(panel)&&!isVacation(panel));
    return panels.find(panel=>/Personal de turno hoy|Dotación en turno hoy|Ver programación|Cargando programación|Turno A|Turno C/i.test(cleanText(panel)))
      ||panels.find(panel=>/^Detalles$/i.test(cleanText(panel.querySelector?.(':scope > summary .stainher-disclosure-title,:scope > summary'))))
      ||(panels.length===1?panels[0]:null);
  }
  function setDisclosureTitle(panel,title){
    if(!panel)return;
    const disclosure=panel.matches('details')?panel:panel.closest('details');
    const titleNode=disclosure?.querySelector(':scope > summary .stainher-disclosure-title,:scope > summary > span:first-of-type');
    if(titleNode)titleNode.textContent=title;
    panel.querySelectorAll?.(':scope h3,.v1512-home-turn h3,.row-between h3').forEach(node=>node.textContent=title);
    panel.setAttribute('aria-label',title);
  }
  function enforceStaffingTitle(page){
    const marker=page.querySelector('.v1521-home-turn,.stainher-home-staffing,[data-stainher-home-panel="staffing"]');
    if(!marker)return;
    const details=[marker.matches('details')?marker:null,marker.closest('details'),...page.querySelectorAll('details')].filter((node,index,list)=>node&&list.indexOf(node)===index&&(node===marker||node.contains(marker)));
    details.forEach(disclosure=>{
      disclosure.classList.add('v1521-home-turn','stainher-home-staffing');disclosure.dataset.stainherHomePanel='staffing';disclosure.setAttribute('aria-label','Dotación en turno hoy');
      const summary=disclosure.querySelector(':scope>summary');if(!summary)return;
      let node=summary.querySelector('.stainher-disclosure-title,.stainher-home-collapse-summary>span:not(.stainher-disclosure-marker):not(.stainher-home-collapse-chevron),span:not(.stainher-disclosure-marker):not(.stainher-home-collapse-chevron)');
      if(!node){node=document.createElement('span');node.className='stainher-disclosure-title';[...summary.childNodes].filter(child=>child.nodeType===Node.TEXT_NODE&&cleanText(child)).forEach(child=>child.remove());summary.appendChild(node)}
      node.classList.add('stainher-disclosure-title');if(node.textContent!=='Dotación en turno hoy')node.textContent='Dotación en turno hoy';node.dataset.stainherFixedTitle='staffing';
    });
  }
  function arrangeHome(){
    const page=document.getElementById('page-inicio');if(!page)return;
    topPanels(page).filter(isVacation).forEach(panel=>panel.remove());
    const vacation=page.querySelector('#vacationBalanceHome');
    const staffing=findStaffing(page);
    const alerts=directPanel(page,'.v153-home-alert-panel');
    if(staffing){
      staffing.classList.add('v1521-home-turn','stainher-home-staffing');
      staffing.dataset.stainherHomePanel='staffing';
    }
    setDisclosureTitle(staffing,'Dotación en turno hoy');
    enforceStaffingTitle(page);
    const vacationPanel=vacation?.closest('details,.panel')||vacation;
    const staffingPanel=staffing&&directChild(page,staffing),alertsPanel=alerts&&directChild(page,alerts);
    vacationPanel?.remove();
    const candidates=[staffingPanel,alertsPanel].filter(Boolean).sort((a,b)=>a===b?0:a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
    if(!candidates.length)return;
    const marker=document.createComment('stainher-home-panels');page.insertBefore(marker,candidates[0]);
    if(staffingPanel)page.insertBefore(staffingPanel,marker);
    if(alertsPanel)page.insertBefore(alertsPanel,marker);
    page.querySelectorAll('details').forEach(details=>{
      const title=String(details.querySelector(':scope>summary')?.textContent||'').replace(/\s+/g,' ').trim();
      const content=String(details.querySelector(':scope>.stainher-disclosure-content')?.textContent||'').replace(/\s+/g,' ').trim();
      if(title==='Detalles'&&!content)details.remove();
    });
    marker.remove();
  }
  async function addBalanceToAccount(){
    const modal=document.querySelector('#modalRoot .modal');if(!modal||modal.querySelector('#accountVacationBalance'))return;
    const uid=window.state?.session?.user?.id;if(!uid||!window.sb)return;
    const query=await window.sb.from('perfiles').select('saldo_vacaciones').eq('id',uid).maybeSingle();
    if(query.error||!modal.isConnected)return;
    const balance=Number(query.data?.saldo_vacaciones??15);
    const card=document.createElement('div');card.id='accountVacationBalance';card.className='panel stainher-account-vacation';
    card.innerHTML=`<small class="muted">Saldo de vacaciones vigente</small><strong>${escHtml(balance.toFixed(2))} días</strong><span class="muted">Actualizado después de solicitudes aprobadas por Recursos Humanos.</span>`;
    const profile=modal.querySelector('.panel');profile?.insertAdjacentElement('afterend',card);
  }
  function install(){
    if(typeof window.renderInicio==='function'&&!window.renderInicio.__stainherHomeLayout){
      const base=window.renderInicio;
      const wrapped=async function(...args){const result=await base.apply(this,args);arrangeHome();requestAnimationFrame(arrangeHome);return result};
      wrapped.__stainherHomeLayout=true;window.renderInicio=wrapped;
    }
    if(typeof window.v157OpenAccount==='function'&&!window.v157OpenAccount.__stainherBalance){
      const base=window.v157OpenAccount;
      const wrapped=function(...args){const result=base.apply(this,args);addBalanceToAccount();return result};
      wrapped.__stainherBalance=true;window.v157OpenAccount=wrapped;
    }
    arrangeHome();
  }
  function mountStyle(){
    if(document.getElementById('stainher-home-layout-style'))return;
    const style=document.createElement('style');style.id='stainher-home-layout-style';style.textContent=`
      .stainher-account-vacation{display:grid;gap:6px;margin:10px 0 0!important}
      .stainher-account-vacation strong{font-size:28px;line-height:1.15;color:var(--text,#fff)}
      .stainher-account-vacation span{font-size:12px}
      #page-inicio [data-stainher-home-panel="staffing"]>summary .stainher-disclosure-title,
      #page-inicio [data-stainher-home-panel="staffing"]>summary>span:not(.stainher-disclosure-marker):first-of-type,
      #page-inicio .stainher-home-staffing>summary .stainher-disclosure-title,
      #page-inicio details.v1521-home-turn>summary .stainher-disclosure-title{
        font-size:0!important
      }
      #page-inicio details.v1521-home-turn>summary{font-size:0!important}
      #page-inicio [data-stainher-home-panel="staffing"]>summary .stainher-disclosure-title::after,
      #page-inicio [data-stainher-home-panel="staffing"]>summary>span:not(.stainher-disclosure-marker):first-of-type::after,
      #page-inicio .stainher-home-staffing>summary .stainher-disclosure-title::after,
      #page-inicio details.v1521-home-turn>summary .stainher-disclosure-title::after{
        content:'Dotación en turno hoy';font-size:16px!important;font-weight:500!important
      }
      #page-inicio details.v1521-home-turn>summary>.stainher-disclosure-marker{font-size:0!important}
    `;document.head.appendChild(style);
  }
  function boot(){
    mountStyle();install();let queued=false;
    new MutationObserver(records=>{if(queued||!records.some(record=>record.addedNodes.length||record.type==='characterData'))return;queued=true;requestAnimationFrame(()=>{queued=false;install()})}).observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('stainher:modules-ready',install);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
