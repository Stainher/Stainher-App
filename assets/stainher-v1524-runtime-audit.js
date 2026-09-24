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
  let started=false,checks=0,timer=null;
  function start(){
    if(started||!hasSession())return false;
    started=true;
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
