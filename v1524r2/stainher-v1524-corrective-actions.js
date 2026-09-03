/* Stainher V15.24 · acciones únicas y alineadas en Historial de intervenciones. */
(()=>{
  'use strict';
  const STYLE_ID='stainher-v1524-corrective-actions-style';
  let scheduled=false;

  function normalizedText(node){return (node?.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('es')}
  function isImport(node){return normalizedText(node).includes('importar excel')}
  function isIncident(node){const text=normalizedText(node);return text.includes('registrar avería')||text.includes('registrar averia')}

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #page-correctivo .stainher-corrective-history-actions{
        display:flex!important;align-items:center!important;justify-content:flex-end!important;
        flex-wrap:wrap!important;gap:10px!important;margin:0!important
      }
      #page-correctivo .stainher-corrective-history-actions .btn{
        width:auto!important;min-height:44px!important;margin:0!important;white-space:nowrap!important
      }
      @media(max-width:700px){
        #page-correctivo .stainher-corrective-history-actions{width:100%!important;justify-content:stretch!important}
        #page-correctivo .stainher-corrective-history-actions .btn{flex:1 1 220px!important;white-space:normal!important}
      }
    `;document.head.appendChild(style);
  }

  function reconcile(){
    scheduled=false;
    const page=document.getElementById('page-correctivo');if(!page)return;
    const buttons=[...page.querySelectorAll('button,.btn')];
    const imports=buttons.filter(isImport),incidents=buttons.filter(isIncident);
    const keepImport=imports.at(-1),keepIncident=incidents.at(-1);
    imports.slice(0,-1).forEach(button=>button.remove());
    incidents.slice(0,-1).forEach(button=>button.remove());
    if(!keepImport||!keepIncident)return;

    const commonParent=keepImport.parentElement===keepIncident.parentElement?keepImport.parentElement:null;
    if(commonParent){
      commonParent.classList.add('stainher-corrective-history-actions');
      /* Orden estable: registrar primero e importar después. */
      const actionNodes=[...commonParent.children].filter(node=>isIncident(node)||isImport(node));
      if(actionNodes[0]!==keepIncident||actionNodes[1]!==keepImport)commonParent.append(keepIncident,keepImport);
    }
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(reconcile)}

  installStyle();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
