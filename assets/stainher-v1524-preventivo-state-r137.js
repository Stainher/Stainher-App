/* Stainher App V15.24 · R137 · Preventivo conserva el equipo abierto tras refrescar
 * Corrige R136: el módulo global de paneles convierte los grupos en <details>
 * después del render, por lo que la restauración anterior ocurría demasiado pronto.
 * R137 conserva el estado por nombre de equipo y lo reaplica después de esa conversión.
 */
(()=>{
  'use strict';
  const BUILD='20260929-r137-preventivo-disclosure-state';
  if(window.__STAINHER_PREVENTIVO_STATE_R137__===BUILD)return;
  window.__STAINHER_PREVENTIVO_STATE_R137__=BUILD;

  const PAGE_ID='page-preventivo';
  const GROUP='v1523-prev-equipment-group';
  const ACTION_RE=/\b(calendarizar|reprogramar|confirmar\s+ejecuci[oó]n)\b/i;
  const rememberedOpen=new Set();
  let pendingAction=null;
  let observer=null;
  let tries=0;

  const page=()=>document.getElementById(PAGE_ID);
  const norm=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase();

  function groupName(node){
    if(!node)return '';
    const title=
      node.querySelector?.(':scope > summary .stainher-disclosure-title')?.textContent||
      node.querySelector?.(':scope > summary')?.textContent||
      node.querySelector?.(':scope > header h4')?.textContent||
      node.querySelector?.('header h4')?.textContent||
      '';
    return norm(title);
  }

  function detailsGroups(){
    const root=page();
    return root?[...root.querySelectorAll(`details.${GROUP}`)]:[];
  }

  function horizontalScroller(group){
    if(!group)return null;
    return group.querySelector('.v1523-prev-equipment-table')||
      [...group.querySelectorAll('*')].find(node=>{
        try{return node.scrollWidth>node.clientWidth+4}catch(_){return false}
      })||null;
  }

  function capture(preferred=null){
    const root=page();
    if(!root)return null;
    const groups=detailsGroups();
    const openNames=groups.filter(node=>node.open).map(groupName).filter(Boolean);
    openNames.forEach(name=>rememberedOpen.add(name));

    const active=preferred||
      document.activeElement?.closest?.(`details.${GROUP}`)||
      null;
    const activeName=groupName(active);
    if(activeName)rememberedOpen.add(activeName);

    const scroller=horizontalScroller(active);
    const rect=active?.getBoundingClientRect?.();
    return {
      openNames,
      activeName,
      activeViewportTop:Number.isFinite(rect?.top)?rect.top:null,
      scrollX:window.scrollX||0,
      scrollY:window.scrollY||0,
      horizontal:scroller?Number(scroller.scrollLeft||0):0,
      positionRestored:false
    };
  }

  function desiredNames(state){
    const names=new Set(rememberedOpen);
    (state?.openNames||[]).forEach(name=>names.add(name));
    if(state?.activeName)names.add(state.activeName);
    return names;
  }

  function markRenderedSections(state){
    const root=page();
    if(!root||!state)return;
    const wanted=desiredNames(state);
    root.querySelectorAll(`section.${GROUP}`).forEach(section=>{
      const name=groupName(section);
      if(wanted.has(name))section.dataset.stainherPreventivoKeepOpen='1';
    });
  }

  function applyOpenState(state){
    const root=page();
    if(!root||!state)return null;
    const wanted=desiredNames(state);
    let active=null;
    root.querySelectorAll(`details.${GROUP}`).forEach(details=>{
      const name=groupName(details);
      if(wanted.has(name)){
        details.open=true;
        rememberedOpen.add(name);
      }
      if(state.activeName&&name===state.activeName)active=details;
    });
    return active;
  }

  function restorePosition(state,active){
    if(!state||state.positionRestored||!active)return;
    const rect=active.getBoundingClientRect?.();
    if(!Number.isFinite(rect?.top))return;
    try{window.scrollTo(state.scrollX||0,state.scrollY||0)}catch(_){}
    const after=active.getBoundingClientRect?.().top;
    if(Number.isFinite(after)&&Number.isFinite(state.activeViewportTop)){
      try{window.scrollBy(0,after-state.activeViewportTop)}catch(_){}
    }
    const scroller=horizontalScroller(active);
    if(scroller&&Number.isFinite(state.horizontal))scroller.scrollLeft=state.horizontal;
    state.positionRestored=true;
  }

  function restore(state){
    if(!state)return false;
    const active=applyOpenState(state);
    if(active){
      requestAnimationFrame(()=>restorePosition(state,active));
      return true;
    }
    return false;
  }

  function scheduleRestore(state){
    if(!state)return;
    [0,16,50,120,260,500].forEach(delay=>{
      setTimeout(()=>restore(state),delay);
    });
  }

  function captureAction(event){
    const target=event.target?.closest?.('button,a,[role="button"]');
    const root=page();
    if(!target||!root||!root.contains(target)||!ACTION_RE.test(norm(target.textContent)))return;
    const group=target.closest?.(`details.${GROUP}`);
    if(!group)return;
    pendingAction=capture(group);
  }

  function rememberToggle(event){
    const details=event.target;
    if(details?.tagName!=='DETAILS'||!details.classList?.contains(GROUP)||!details.closest?.('#'+PAGE_ID))return;
    const name=groupName(details);
    if(!name)return;
    if(details.open)rememberedOpen.add(name);
    else rememberedOpen.delete(name);
  }

  function enhanceAdded(root,state=pendingAction){
    if(!root?.querySelectorAll)return;
    const nodes=[];
    if(root.matches?.(`details.${GROUP}`))nodes.push(root);
    root.querySelectorAll(`details.${GROUP}`).forEach(node=>nodes.push(node));
    const wanted=desiredNames(state);
    nodes.forEach(details=>{
      const name=groupName(details);
      if(details.dataset.stainherPreventivoKeepOpen==='1'||wanted.has(name)){
        details.open=true;
        rememberedOpen.add(name);
      }
    });
    if(state)scheduleRestore(state);
  }

  function ensureObserver(){
    const root=page();
    if(!root)return false;
    if(observer)observer.disconnect();
    observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType===1)enhanceAdded(node,pendingAction);
        }
      }
    });
    observer.observe(root,{childList:true,subtree:true});
    return true;
  }

  function wrapContentRenderer(name){
    const current=window[name];
    if(typeof current!=='function')return false;
    if(current.__stainherPreventivoStateR137)return true;
    const wrapped=function(){
      const before=pendingAction||capture();
      if(before){
        before.openNames.forEach(item=>rememberedOpen.add(item));
        if(before.activeName)rememberedOpen.add(before.activeName);
      }
      const out=current.apply(this,arguments);
      markRenderedSections(before);
      scheduleRestore(before);
      if(pendingAction===before){
        setTimeout(()=>{if(pendingAction===before)pendingAction=null},700);
      }
      return out;
    };
    wrapped.__stainherPreventivoStateR137=true;
    wrapped.__base=current;
    window[name]=wrapped;
    return true;
  }

  function install(){
    document.removeEventListener('click',captureAction,true);
    document.addEventListener('click',captureAction,true);
    document.removeEventListener('toggle',rememberToggle,true);
    document.addEventListener('toggle',rememberToggle,true);

    const currentOpen=detailsGroups().filter(node=>node.open).map(groupName).filter(Boolean);
    currentOpen.forEach(name=>rememberedOpen.add(name));

    ensureObserver();
    const modern=wrapContentRenderer('v1523RenderPreventiveContent');
    wrapContentRenderer('v1520RenderPreventivoContent');
    if(modern)return true;
    if(++tries<120)setTimeout(install,100);
    return false;
  }

  window.StainherPreventivoStateR137={
    install,
    capture,
    restore,
    rememberedOpen,
    version:BUILD
  };

  window.addEventListener('stainher:modules-ready',()=>setTimeout(install,0));
  window.addEventListener('stainher:runtime-r136-ready',()=>setTimeout(install,0));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
