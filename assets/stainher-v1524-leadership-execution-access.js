/* Stainher App V15.24 · acceso de ejecución para Liderazgo en Terreno.
 * Prevención y perfiles administrativos con acceso a Liderazgo pueden ejecutar controles libremente.
 * R377: Supervisor y Técnico también pueden ejecutar controles de forma libre.
 * La gestión de metas y plantillas permanece protegida por RLS.
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

  function isLeadershipExecutor(){
    const role=profileText();
    if(!role)return false;
    return /(^|\b)(administrador|administrativo|administrativa|administracion|confiabilidad|planificacion|planificador|planificadora|programacion|programador|programadora|prevencion|prevencionista|experto en prevencion|experta en prevencion|apr|supervisor|tecnico|tecnica)(\b|$)/.test(role);
  }

  let baseCanExecute=typeof window.canExecuteLeadershipV11==='function'?window.canExecuteLeadershipV11:null;
  let baseFreeRole=typeof window.v1512LeadershipFreeRole==='function'?window.v1512LeadershipFreeRole:null;

  function canExecuteLeadershipUnlocked(...args){
    if(isLeadershipExecutor())return true;
    try{return baseCanExecute?!!baseCanExecute.apply(this,args):false}catch(_){return false}
  }

  function leadershipFreeRoleUnlocked(...args){
    if(isLeadershipExecutor())return true;
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
      install,
      canExecute:()=>canExecuteLeadershipUnlocked(),
      isFreeProfile:isLeadershipExecutor,
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

/* Carga del correo obligatorio para controles Stainher realizados. */
(()=>{
  if(window.__STAINHER_LEADERSHIP_MAIL_LOADER__)return;
  window.__STAINHER_LEADERSHIP_MAIL_LOADER__=true;
  const file='stainher-v1524-leadership-mail.js';
  if(document.querySelector(`script[data-stainher-module="${file}"]`))return;
  const source=document.currentScript?.src||location.href,script=document.createElement('script');
  script.src=new URL(file,source).href+'?build=20260910-r35-leadership-mail-required';
  script.async=false;script.dataset.stainherModule=file;
  script.addEventListener('error',()=>console.error('[Stainher Liderazgo] No se pudo cargar el correo automático de controles.'),{once:true});
  document.head.appendChild(script);
})();

/* Desarrollo 29: cargar RIT sólo como módulo adicional de Liderazgo. */
(()=>{
  if(window.__STAINHER_RIT_R331_LOADER__)return;
  window.__STAINHER_RIT_R331_LOADER__=true;
  const tag=document.createElement('script');
  const src=document.currentScript?.src||location.href;
  tag.src=new URL('stainher-v1524-rit-r331.js',src).href+'?build=r341-20261103';
  tag.async=false;tag.dataset.stainherModule='stainher-v1524-rit-r331.js';
  tag.onerror=()=>console.error('[Stainher RIT] Falló la carga del asistente R331');
  document.head.appendChild(tag);
})();

/* Desarrollo 29: motor PDF de RIT sobre plantilla Codelco original. */
(()=>{
 if(window.__STAINHER_RIT_PDF_R331_LOADER__)return;
 window.__STAINHER_RIT_PDF_R331_LOADER__=true;
 const script=document.createElement('script');
 const src=document.currentScript?.src||location.href;
 script.src=new URL('stainher-v1524-rit-pdf-r331.js',src).href+'?build=r341-20261103';
 script.async=false;script.dataset.stainherModule='stainher-v1524-rit-pdf-r331.js';
 script.onerror=()=>console.error('[Stainher RIT] Falló la carga del motor PDF.');
 document.head.appendChild(script);
})();
