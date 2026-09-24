/* Stainher V15.24 · R108 · Administración contractual completa para Confiabilidad. */
(()=>{
  'use strict';
  if(window.__STAINHER_RELIABILITY_CONTRACT_R108__)return;
  window.__STAINHER_RELIABILITY_CONTRACT_R108__=true;

  function install(){
    try{
      if(typeof V11_DEFAULTS!=='undefined')V11_DEFAULTS.confiabilidad={...(V11_DEFAULTS.confiabilidad||{}),contrato:'editar'};
      if(typeof V1523_DEFAULTS!=='undefined')V1523_DEFAULTS.confiabilidad={...(V1523_DEFAULTS.confiabilidad||{}),contrato:'editar'};
      const profile=window.state?.profile;
      if(String(profile?.rol||'').trim().toLowerCase()==='confiabilidad')profile.permisos={...(profile.permisos||{}),contrato:'editar'};
      window.applyPermissionsV11?.();
    }catch(error){console.error('[Stainher Confiabilidad Contrato R108]',error)}
  }

  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:access-r107-ready',install);
  window.StainherReliabilityContractR108=Object.freeze({install});
})();
