/* Stainher App V15.24 · R136 · Preventivo conserva panel y posición
 * - Calendarizar, reprogramar o confirmar ejecución no colapsa el equipo activo.
 * - Conserva los demás grupos que el usuario dejó abiertos.
 * - Restaura la posición vertical y el desplazamiento horizontal del bloque activo.
 * - No modifica datos, filtros, Plan Matriz ni reglas del período contractual.
 */
(()=>{
  'use strict';
  const BUILD='20260929-r136-preventivo-keep-open';
  if(window.__STAINHER_PREVENTIVO_STATE_R136__===BUILD)return;
  window.__STAINHER_PREVENTIVO_STATE_R136__=BUILD;

  const PAGE_ID='page-preventivo';
  const ACTION_RE=/\b(calendarizar|reprogramar|confirmar\s+ejecuci[oó]n)\b/i;
  let lastActionSnapshot=null;
  let tries=0;

  const page=()=>document.getElementById(PAGE_ID);
  const norm=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase();

  function detailsList(root=page()){
    return root?[...root.querySelectorAll('details')]:[];
  }

  function detailKey(detail,index=0){
    if(!detail)return '';
    const direct=[
      detail.dataset?.equipoId,
      detail.dataset?.equipmentId,
      detail.dataset?.preventivoEquipoId,
      detail.getAttribute?.('data-equipo'),
      detail.id
    ].find(Boolean);
    if(direct)return 'id:'+norm(direct);
    const summary=detail.querySelector(':scope > summary')||detail.querySelector('summary');
    const label=norm(summary?.textContent);
    return label?'summary:'+label:'index:'+index;
  }

  function findDetailByKey(root,key){
    if(!root||!key)return null;
    const rows=detailsList(root);
    return rows.find((detail,index)=>detailKey(detail,index)===key)||null;
  }

  function horizontalScroller(detail){
    if(!detail)return null;
    const candidates=[detail,...detail.querySelectorAll('*')].filter(node=>{
      try{return node.scrollWidth>node.clientWidth+4}catch(_){return false}
    });
    return candidates.find(node=>Number(node.scrollLeft)>0)||candidates[0]||null;
  }

  function snapshot(preferredDetail=null){
    const root=page();
    if(!root)return null;
    const rows=detailsList(root);
    const focused=document.activeElement?.closest?.('details');
    const active=preferredDetail||focused||null;
    const activeIndex=active?rows.indexOf(active):-1;
    const scroller=horizontalScroller(active);
    const box=active?.getBoundingClientRect?.();
    return {
      openKeys:rows.map((detail,index)=>detail.open?detailKey(detail,index):null).filter(Boolean),
      activeKey:active?detailKey(active,activeIndex<0?0:activeIndex):null,
      activeViewportTop:Number.isFinite(box?.top)?box.top:null,
      scrollX:window.scrollX||0,
      scrollY:window.scrollY||0,
      horizontal:scroller?Number(scroller.scrollLeft||0):0
    };
  }

  function restore(state){
    const root=page();
    if(!root||!state)return;
    const wanted=new Set(state.openKeys||[]);
    if(state.activeKey)wanted.add(state.activeKey);
    const rows=detailsList(root);
    rows.forEach((detail,index)=>{
      if(wanted.has(detailKey(detail,index)))detail.open=true;
    });
    const active=findDetailByKey(root,state.activeKey);

    const finish=()=>{
      try{window.scrollTo(state.scrollX||0,state.scrollY||0)}catch(_){}
      if(active){
        const scroller=horizontalScroller(active);
        if(scroller&&Number.isFinite(state.horizontal))scroller.scrollLeft=state.horizontal;
        if(Number.isFinite(state.activeViewportTop)){
          const now=active.getBoundingClientRect?.().top;
          if(Number.isFinite(now)){
            try{window.scrollBy(0,now-state.activeViewportTop)}catch(_){}
          }
        }
      }
    };
    requestAnimationFrame(()=>requestAnimationFrame(finish));
  }

  function captureAction(event){
    const target=event.target?.closest?.('button,a,[role="button"]');
    if(!target)return;
    const root=page();
    if(!root||!root.contains(target)||!ACTION_RE.test(norm(target.textContent)))return;
    const detail=target.closest('details');
    if(!detail)return;
    lastActionSnapshot=snapshot(detail);
  }

  function wrapRenderer(){
    const current=window.renderPreventivo;
    if(typeof current!=='function')return false;
    if(current.__stainherPreventivoStateR136)return true;
    const wrapped=async function(){
      const before=snapshot()||lastActionSnapshot;
      const out=await current.apply(this,arguments);
      restore(before||lastActionSnapshot);
      lastActionSnapshot=null;
      return out;
    };
    wrapped.__stainherPreventivoStateR136=true;
    wrapped.__base=current;
    window.renderPreventivo=wrapped;
    return true;
  }

  function install(){
    document.removeEventListener('click',captureAction,true);
    document.addEventListener('click',captureAction,true);
    if(wrapRenderer())return true;
    if(++tries<120)setTimeout(install,100);
    return false;
  }

  window.StainherPreventivoStateR136={install,snapshot,restore,version:BUILD};
  window.addEventListener('stainher:modules-ready',()=>setTimeout(install,0));
  window.addEventListener('stainher:runtime-r135-ready',()=>setTimeout(install,0));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
