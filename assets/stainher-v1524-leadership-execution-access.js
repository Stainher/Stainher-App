/* Stainher App V15.24 · acceso de ejecución para Liderazgo en Terreno.
 * Prevención y perfiles administrativos con acceso a Liderazgo pueden ejecutar controles libremente.
 * Supervisor/Técnico conservan las reglas de programación existentes.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_LEADERSHIP_EXECUTION_ACCESS__)return;
  window.__STAINHER_LEADERSHIP_EXECUTION_ACCESS__=true;

  const norm=value=>String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim().toLowerCase();

  function profileText(){
    let runtimeRole='';
    try{runtimeRole=typeof window.v11Role==='function'?window.v11Role():''}catch(_){ }
    const profile=window.state?.profile||{};
    return norm([
      runtimeRole,
      profile.rol,
      profile.role,
      profile.perfil,
      profile.cargo,
      profile.cargo_nombre,
      profile.nombre_cargo,
      profile.tipo_cargo
    ].filter(Boolean).join(' '));
  }

  function isPreventionOrAdministrative(){
    const role=profileText();
    if(!role)return false;
    return /(^|\b)(administrador|administrativo|administrativa|administracion|confiabilidad|planificacion|planificador|planificadora|programacion|programador|programadora|prevencion|prevencionista|experto en prevencion|experta en prevencion|apr)(\b|$)/.test(role);
  }

  let baseCanExecute=typeof window.canExecuteLeadershipV11==='function'?window.canExecuteLeadershipV11:null;
  let baseFreeRole=typeof window.v1512LeadershipFreeRole==='function'?window.v1512LeadershipFreeRole:null;

  function canExecuteLeadershipUnlocked(...args){
    if(isPreventionOrAdministrative())return true;
    try{return baseCanExecute?!!baseCanExecute.apply(this,args):false}catch(_){return false}
  }

  function leadershipFreeRoleUnlocked(...args){
    if(isPreventionOrAdministrative())return true;
    try{return baseFreeRole?!!baseFreeRole.apply(this,args):false}catch(_){return false}
  }

  function install(){
    if(typeof window.canExecuteLeadershipV11==='function'&&window.canExecuteLeadershipV11!==canExecuteLeadershipUnlocked){
      baseCanExecute=window.canExecuteLeadershipV11;
    }
    if(typeof window.v1512LeadershipFreeRole==='function'&&window.v1512LeadershipFreeRole!==leadershipFreeRoleUnlocked){
      baseFreeRole=window.v1512LeadershipFreeRole;
    }
    window.canExecuteLeadershipV11=canExecuteLeadershipUnlocked;
    window.v1512LeadershipFreeRole=leadershipFreeRoleUnlocked;
    window.StainherLeadershipAccess=Object.freeze({
      canExecute:()=>canExecuteLeadershipUnlocked(),
      isFreeProfile:isPreventionOrAdministrative,
      profileText
    });
  }

  function refreshLeadershipIfVisible(){
    const page=document.getElementById('page-liderazgo');
    if(!page||page.classList.contains('hidden')||page.offsetParent===null)return;
    Promise.resolve(window.renderLiderazgoV95?.()).catch(error=>console.error('[Stainher Liderazgo] No se pudo refrescar acceso de ejecución',error));
  }

  install();
  window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(()=>{install();refreshLeadershipIfVisible()},80)},{once:true});
  setTimeout(install,350);
  setTimeout(()=>{install();refreshLeadershipIfVisible()},1200);
  setTimeout(install,2500);
})();
