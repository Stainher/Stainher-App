/* Stainher V15.24 · Runtime Audit R112 · carga autenticada sin módulos duplicados. */
(()=>{
  'use strict';
  if(window.__STAINHER_RUNTIME_AUDIT_R112__)return;
  window.__STAINHER_RUNTIME_AUDIT_R112__=true;

  const BUILD='20260924-r112-loader-consolidation';
  const load=(id,src,onload)=>{
    if(document.getElementById(id)){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('[Stainher R112] '+src),{once:true});
    document.head.appendChild(s);
  };

  const hasSession=()=>Boolean(window.state?.session?.user||window.state?.user?.id);
  let started=false,checks=0,timer=null,ritLoad;
  function loadRit(){
    if(window.StainherRITModalR390)return Promise.resolve();
    if(!ritLoad){
      ritLoad=new Promise(resolve=>{
        const script=document.createElement('script');
        script.id='stainher-rit-modal-r390';
        script.src='stainher-v1524-rit-control-modal-r390.js?build=20261118-rit-first-render';
        script.onload=resolve;
        script.onerror=()=>{
          script.remove();
          ritLoad=null;
          console.warn('[Stainher RIT] No se pudo cargar el control.');
          resolve();
        };
        document.head.appendChild(script);
      });
    }
    return ritLoad;
  }
  function prepareLeadership(){
    const render=window.renderLiderazgoV95;
    if(typeof render!=='function'||render.__stainherR390||render.__stainherRitReady)return;
    const ready=async function(...args){
      if(hasSession())await loadRit();
      const result=await render.apply(this,args);
      window.StainherRITModalR390?.mount();
      return result;
    };
    ready.__stainherRitReady=true;
    ready.__base=render;
    window.renderLiderazgoV95=ready;
  }
  window.StainherLoadRITModal=loadRit;
  prepareLeadership();
  window.addEventListener('stainher:modules-ready',prepareLeadership);
  function start(){
    if(started||!hasSession())return false;
    started=true;
    prepareLeadership();
    loadRit();
    if(timer){clearInterval(timer);timer=null;}
    load('stainher-runtime-audit-legacy-r112',`stainher-v1524-runtime-audit-legacy-r49.js?build=${BUILD}`);
    load('stainher-home-no-vacation-r112',`stainher-v1524-home-no-vacation-r57.js?build=${BUILD}`);
    load('stainher-turnos-teletrabajo-r112',`stainher-turnos-teletrabajo-r75.js?build=${BUILD}-${Date.now()}`);
    load('stainher-turnos-event-grid-r112',`stainher-turnos-event-grid-r79.js?build=${BUILD}-${Date.now()}`);
    load('stainher-hp-loader-r112',`stainher-v1524-hp-loader-r72.js?build=${BUILD}-${Date.now()}`);
    load('stainher-leadership-orphan-runtime-r112',`stainher-v1524-leadership-orphan-filter.js?build=${BUILD}`);
    return true;
  }

  window.addEventListener('stainher:profile-ready',start);
  window.addEventListener('stainher:session-ready',start);
  if(!start())timer=setInterval(()=>{if(start()||++checks>=120){clearInterval(timer);timer=null;}},1000);
})();
