/* Stainher V15.24 · R82 · Integración nativa de Presupuestos en Administración del Contrato.
 * Adapta R80 al renderer contractual productivo v1520 (.v1520-tabs / setContractTab).
 * Sin MutationObserver, sin interceptores globales y sin cambios de login/sesión.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r82-presupuestos-v1520-router';
  if(window.__STAINHER_PRESUPUESTOS_ROUTER_R82__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_ROUTER_R82__=BUILD;

  const TAB='presupuestos';

  function tabRoot(){
    return document.querySelector('#page-contrato .v1520-tabs')
      || document.querySelector('#page-contrato #v1519ContractTabs')
      || document.querySelector('#page-contrato .v1516-contract-tabs')
      || document.querySelector('#page-contrato .contract-tabs');
  }

  function renderBudget(){
    if(!window.state)return;
    window.state.contractTab=TAB;
    const fn=window.renderContractTab;
    if(typeof fn==='function')return fn();
  }

  function mountTab(){
    const tabs=tabRoot();
    if(!tabs)return false;
    let btn=tabs.querySelector('[data-r82-presupuestos]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className=tabs.classList.contains('v1520-tabs')?'btn':'contract-tab';
      btn.dataset.r82Presupuestos='1';
      btn.textContent='Presupuestos';
      btn.addEventListener('click',()=>{
        if(window.state)window.state.contractTab=TAB;
        tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===btn));
        renderBudget();
      });
      const forecast=[...tabs.querySelectorAll('button')].find(x=>/Forecast/i.test(x.textContent||''));
      forecast?tabs.insertBefore(btn,forecast):tabs.appendChild(btn);
    }
    const active=window.state?.contractTab===TAB;
    tabs.querySelectorAll('button').forEach(x=>{
      if(x===btn)x.classList.toggle('active',active);
      else if(active)x.classList.remove('active');
    });
    return true;
  }

  function wrapSetContractTab(){
    const current=window.setContractTab;
    if(typeof current!=='function'||current.__presupuestosR82)return;
    const wrapped=async function(tab){
      if(tab===TAB){
        if(window.state)window.state.contractTab=TAB;
        mountTab();
        return renderBudget();
      }
      const out=await current.apply(this,arguments);
      mountTab();
      return out;
    };
    wrapped.__presupuestosR82=true;
    wrapped.__base=current;
    window.setContractTab=wrapped;
  }

  function wrapRenderContrato(){
    const current=window.renderContrato;
    if(typeof current!=='function'||current.__presupuestosR82)return;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      mountTab();
      if(window.state?.contractTab===TAB)renderBudget();
      return out;
    };
    wrapped.__presupuestosR82=true;
    wrapped.__base=current;
    window.renderContrato=wrapped;
  }

  function install(){
    wrapSetContractTab();
    wrapRenderContrato();
    mountTab();
    if(window.state?.contractTab===TAB)renderBudget();
  }

  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:presupuestos-r81-ready',install);
  window.StainherPresupuestosRouterR82={install,mountTab,render:renderBudget};
})();
