/* Stainher V15.24 · R93 · Comunicados e informes dentro de Administración del Contrato.
 * Integra R92 como pestaña contractual nativa sin tocar login ni agregar observers globales.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r93-free-report-contract';
  if(window.__STAINHER_FREE_REPORT_CONTRACT_R93__===BUILD)return;
  window.__STAINHER_FREE_REPORT_CONTRACT_R93__=BUILD;
  const TAB='comunicados_informes';

  function tabs(){return document.querySelector('#page-contrato .v1520-tabs')||document.querySelector('#page-contrato #v1519ContractTabs')||document.querySelector('#page-contrato .v1516-contract-tabs')||document.querySelector('#page-contrato .contract-tabs')}
  function content(){return document.querySelector('#page-contrato #contractContent')||document.querySelector('#page-contrato [data-contract-content]')||document.querySelector('#page-contrato .contract-content')}

  function render(){
    const c=content();if(!c)return false;
    if(window.state)window.state.contractTab=TAB;
    c.innerHTML=`<section class="panel" style="margin-top:12px"><div class="row-between" style="gap:14px;align-items:flex-start;flex-wrap:wrap"><div><h3 style="margin:0 0 5px">Comunicados e informes</h3><div class="muted">Genera documentos libres en formato corporativo Stainher, con firma del usuario ejecutor.</div></div><button type="button" class="btn primary" data-r93-create-document>Crear documento</button></div><div class="muted" style="margin-top:14px">Puedes generar un Informe o Comunicado, definir destinatario, fecha, contenido y observaciones, utilizar tu firma personal guardada y descargar el PDF.</div></section>`;
    c.querySelector('[data-r93-create-document]')?.addEventListener('click',()=>window.StainherFreeReportR92?.openModal?.());
    return true;
  }

  function mountTab(){
    const root=tabs();if(!root)return false;
    let b=root.querySelector('[data-r93-free-report]');
    if(!b){
      b=document.createElement('button');b.type='button';b.dataset.r93FreeReport='1';b.className=root.classList.contains('v1520-tabs')?'btn':'contract-tab';b.textContent='Comunicados e informes';
      b.addEventListener('click',()=>{if(window.state)window.state.contractTab=TAB;root.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()});
      const forecast=[...root.querySelectorAll('button')].find(x=>/Forecast/i.test(x.textContent||''));forecast?root.insertBefore(b,forecast):root.appendChild(b);
    }
    const active=window.state?.contractTab===TAB;root.querySelectorAll('button').forEach(x=>{if(x===b)x.classList.toggle('active',active);else if(active)x.classList.remove('active')});
    return true;
  }

  function wrapSetContractTab(){
    const current=window.setContractTab;if(typeof current!=='function'||current.__freeReportR93)return;
    const wrapped=async function(tab){if(tab===TAB){if(window.state)window.state.contractTab=TAB;mountTab();return render()}const out=await current.apply(this,arguments);mountTab();return out};
    wrapped.__freeReportR93=true;wrapped.__base=current;window.setContractTab=wrapped;
  }

  function wrapRenderContrato(){
    const current=window.renderContrato;if(typeof current!=='function'||current.__freeReportR93)return;
    const wrapped=async function(){const out=await current.apply(this,arguments);mountTab();if(window.state?.contractTab===TAB)render();return out};
    wrapped.__freeReportR93=true;wrapped.__base=current;window.renderContrato=wrapped;
  }

  function install(){wrapSetContractTab();wrapRenderContrato();mountTab();if(window.state?.contractTab===TAB)render()}
  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:free-report-r92-ready',install);
  window.StainherFreeReportContractR93=Object.freeze({install,mountTab,render});
})();
