(function installPermisoNoRemuneradoR23(){
  'use strict';
  if(window.__STAINHER_PERMISO_NO_REMUNERADO_R23__)return;
  window.__STAINHER_PERMISO_NO_REMUNERADO_R23__=true;
  const BUILD='20260909-r23-permiso-no-remunerado';
  const baseLabel=window.v152RequestLabel;
  window.v152RequestLabel=function(type){return String(type||'')==='permiso'?'Permiso no remunerado':baseLabel?.(type)||String(type||'Solicitud')};
  const baseStatus=window.v1517RequestStatus;
  window.v1517RequestStatus=function(request){if(String(request?.estado||'')==='cancelada')return ['bad','Cancelada por el solicitante'];return baseStatus?.(request)||['warn',request?.estado||'Pendiente']};
  function updateFormLabel(){const option=document.querySelector('#modalRoot form select[name="tipo"] option[value="permiso"]');if(option)option.textContent='Permiso no remunerado'}
  const baseModal=window.v154RequestModal;
  if(typeof baseModal==='function'){
    const wrapped=async function(...args){const result=await baseModal.apply(this,args);updateFormLabel();return result};wrapped.__unpaidLeave=BUILD;
    window.v154RequestModal=wrapped;window.v152RequestModal=wrapped;window.v15VacationModal=wrapped;
  }
  const modalRoot=document.getElementById('modalRoot');if(modalRoot)new MutationObserver(updateFormLabel).observe(modalRoot,{childList:true,subtree:true});
  window.STAINHER_UNPAID_LEAVE={build:BUILD,ready:true};
})();
