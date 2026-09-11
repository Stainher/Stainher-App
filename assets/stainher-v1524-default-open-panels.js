/* Stainher V15.24 · paneles operativos abiertos por defecto. */
(()=>{
  'use strict';
  if(window.__STAINHER_DEFAULT_OPEN_PANELS__)return;
  window.__STAINHER_DEFAULT_OPEN_PANELS__=true;

  const norm=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  const DEFAULT_OPEN=new Set([
    'Cumplimiento por usuario',
    'Controles realizados',
    'Programación de controles',
    'Controles Stainher',
    'Dotación en turno hoy',
    'Personal de turno hoy'
  ].map(norm));

  function titleOf(details){
    const summary=details?.querySelector?.(':scope > summary');
    return norm(
      summary?.querySelector?.('.stainher-disclosure-title')?.textContent||
      summary?.textContent||
      details?.getAttribute?.('aria-label')||''
    );
  }

  function isTarget(details){
    return details?.tagName==='DETAILS'&&DEFAULT_OPEN.has(titleOf(details));
  }

  function readyForDefault(details){
    return details?.dataset?.stainherDisclosure==='1'||details?.classList?.contains('stainher-disclosure');
  }

  function applyDefaults(root=document,{force=false}={}){
    const nodes=[];
    if(root?.tagName==='DETAILS')nodes.push(root);
    root?.querySelectorAll?.('details').forEach(node=>nodes.push(node));
    nodes.forEach(details=>{
      if(!isTarget(details)||!readyForDefault(details))return;
      if(!force&&details.dataset.stainherDefaultOpenApplied==='1')return;
      details.open=true;
      details.dataset.stainherDefaultOpenApplied='1';
    });
  }

  function activePageRoot(pageId){
    return document.getElementById(`page-${pageId}`)||document;
  }

  function applyAfterNavigation(pageId){
    [30,120,350].forEach(delay=>setTimeout(()=>applyDefaults(activePageRoot(pageId),{force:true}),delay));
  }

  function install(){
    applyDefaults();
    [120,500,1400].forEach(delay=>setTimeout(()=>applyDefaults(),delay));

    document.addEventListener('click',event=>{
      const control=event.target.closest?.('[data-page]');
      const pageId=control?.dataset?.page;
      if(pageId)applyAfterNavigation(pageId);
    },true);

    window.addEventListener('stainher:modules-ready',()=>{
      [0,100,400].forEach(delay=>setTimeout(()=>applyDefaults(document,{force:true}),delay));
    });

    let queued=false;
    new MutationObserver(records=>{
      if(queued||!records.some(record=>record.addedNodes.length))return;
      queued=true;
      requestAnimationFrame(()=>{
        queued=false;
        applyDefaults();
      });
    }).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
