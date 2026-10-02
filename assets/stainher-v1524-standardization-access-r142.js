/* Stainher V15.24 · R142/R144 · Integración de Estandarización al núcleo de permisos.
 * R142 corrige permisos y navegación de R141.
 * R144 carga el dashboard gráfico y el informe PDF de Estandarización.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r144-standardization-dashboard-bridge';
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
  let dashboardPromise=null;

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

  function loadDashboardR144(){
    if(window.StainherStandardizationDashboardR144){
      window.StainherStandardizationDashboardR144.install?.();
      return Promise.resolve(window.StainherStandardizationDashboardR144);
    }
    if(dashboardPromise)return dashboardPromise;
    dashboardPromise=new Promise((resolve,reject)=>{
      const id='stainher-standardization-dashboard-runtime-r144';
      document.getElementById(id)?.remove();
      const script=document.createElement('script');
      script.id=id;
      script.async=false;
      script.src=`stainher-v1524-standardization-dashboard-r144.js?build=${encodeURIComponent(BUILD+'-'+Date.now())}`;
      script.addEventListener('load',()=>{
        window.StainherStandardizationDashboardR144?.install?.();
        window.dispatchEvent(new CustomEvent('stainher:standardization-dashboard-r144-ready'));
        resolve(window.StainherStandardizationDashboardR144||null);
      },{once:true});
      script.addEventListener('error',()=>{
        dashboardPromise=null;
        reject(new Error('No fue posible cargar el dashboard R144 de Estandarización.'));
      },{once:true});
      document.head.appendChild(script);
    });
    return dashboardPromise;
  }

  function refreshPermissions(){
    registerPermissions();
    registerRenderers();
    try{window.applyPermissionsV11?.()}catch(error){console.warn('[Stainher R142] applyPermissions',error)}
    try{window.v1519DecorateSidebar?.()}catch(_){}
    try{window.v1519BuildMobileNav?.()}catch(_){}
    try{window.v1518DecorateSidebar?.()}catch(_){}
    try{window.v1518BuildMobileNav?.()}catch(_){}
    loadDashboardR144().catch(error=>console.error('[Stainher R144]',error));
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
    loadDashboardR144,
    defaults:{...DEFAULTS},
    version:BUILD
  });

  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:standardization-r141-ready',()=>{refreshPermissions();loadDashboardR144().catch(error=>console.error('[Stainher R144]',error))});
  window.addEventListener('stainher:runtime-r141-ready',refreshPermissions);
  window.addEventListener('stainher:runtime-r142-ready',()=>loadDashboardR144().catch(error=>console.error('[Stainher R144]',error)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
