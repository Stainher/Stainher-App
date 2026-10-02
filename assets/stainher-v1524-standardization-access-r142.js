/* Stainher V15.24 · R142 · Integración de Estandarización al núcleo de permisos.
 * Corrige R141: el módulo existía y tenía RLS, pero no estaba registrado en
 * V11_DEFAULTS / V1518_MODULES ni en el renderizador global V15.23.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r142-standardization-access';
  if(window.__STAINHER_STANDARDIZATION_ACCESS_R142__===BUILD)return;
  window.__STAINHER_STANDARDIZATION_ACCESS_R142__=BUILD;

  const MODULE='estandarizacion';
  const LABEL='Estandarización';
  const DEFAULTS={
    administrador:'editar',
    gerente:'ver',
    planificador:'editar',
    confiabilidad:'editar',
    prevencion:'editar',
    supervisor:'editar',
    tecnico:'ninguno',
    consulta:'ninguno',
    recursos_humanos:'ninguno'
  };

  function registerPermissions(){
    try{
      if(typeof V11_MODULES!=='undefined' && Array.isArray(V11_MODULES) && !V11_MODULES.includes(MODULE)){
        const equipmentIndex=V11_MODULES.indexOf('equipos');
        V11_MODULES.splice(equipmentIndex>=0?equipmentIndex+1:V11_MODULES.length,0,MODULE);
      }
    }catch(error){console.warn('[Stainher R142] V11_MODULES',error)}

    try{
      if(typeof V11_LABELS!=='undefined')V11_LABELS[MODULE]=LABEL;
    }catch(error){console.warn('[Stainher R142] V11_LABELS',error)}

    try{
      if(typeof V11_DEFAULTS!=='undefined'){
        Object.entries(DEFAULTS).forEach(([role,level])=>{
          V11_DEFAULTS[role]=V11_DEFAULTS[role]||{};
          V11_DEFAULTS[role][MODULE]=level;
        });
      }
    }catch(error){console.warn('[Stainher R142] V11_DEFAULTS',error)}

    try{
      if(typeof V1518_MODULES!=='undefined'){
        V1518_MODULES[MODULE]={label:LABEL,icon:'◇',priority:6.5};
      }
    }catch(error){console.warn('[Stainher R142] V1518_MODULES',error)}
  }

  function wrapRenderer(name){
    let current;
    try{current=eval(name)}catch(_){current=window[name]}
    if(typeof current!=='function')return false;
    if(current.__stainherStandardizationR142)return true;

    const wrapped=async function(page){
      if(page===MODULE){
        if(typeof window.renderEstandarizacion!=='function'){
          throw new Error('Estandarización aún no está disponible.');
        }
        return await window.renderEstandarizacion();
      }
      return await current.apply(this,arguments);
    };
    wrapped.__stainherStandardizationR142=true;
    wrapped.__base=current;

    try{eval(name+'=wrapped')}catch(_){}
    try{window[name]=wrapped}catch(_){}
    return true;
  }

  function registerRenderers(){
    wrapRenderer('v1523RenderModule');
    wrapRenderer('v1519RenderModule');
    wrapRenderer('v1518RenderModule');
  }

  function refreshPermissions(){
    registerPermissions();
    registerRenderers();
    try{window.applyPermissionsV11?.()}catch(error){console.warn('[Stainher R142] applyPermissions',error)}
    try{window.v1519DecorateSidebar?.()}catch(_){}
    try{window.v1519BuildMobileNav?.()}catch(_){}
    try{window.v1518DecorateSidebar?.()}catch(_){}
    try{window.v1518BuildMobileNav?.()}catch(_){}
  }

  function install(){
    refreshPermissions();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      registerPermissions();
      registerRenderers();
      if(typeof window.renderEstandarizacion==='function'||tries>=120){
        clearInterval(timer);
        refreshPermissions();
      }
    },100);
  }

  window.StainherStandardizationAccessR142=Object.freeze({
    install,
    refreshPermissions,
    defaults:{...DEFAULTS},
    version:BUILD
  });

  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:standardization-r141-ready',refreshPermissions);
  window.addEventListener('stainher:runtime-r141-ready',refreshPermissions);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
