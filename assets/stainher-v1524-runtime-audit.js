/* Stainher V15.24 · Runtime Audit R69 · no ejecutar parches de app antes de autenticación. */
(()=>{
  'use strict';
  if(window.__STAINHER_RUNTIME_AUDIT_R69__)return;
  window.__STAINHER_RUNTIME_AUDIT_R69__=true;

  const BUILD='20260914-r69-hp-encierros';
  const load=(id,src,onload)=>{
    if(document.getElementById(id)){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('[Stainher R69] '+src),{once:true});
    document.head.appendChild(s);
  };

  const hasSession=()=>Boolean(window.state?.session?.user||window.state?.user?.id);
  let started=false,checks=0,timer=null;
  function start(){
    if(started||!hasSession())return false;
    started=true;
    if(timer){clearInterval(timer);timer=null;}
    load('stainher-runtime-audit-legacy-r69',`stainher-v1524-runtime-audit-legacy-r49.js?build=${BUILD}`);
    load('stainher-home-no-vacation-r69',`stainher-v1524-home-no-vacation-r57.js?build=${BUILD}`);
    load('stainher-weekly-hp-runtime-r69',`stainher-v1524-weekly-hp-report.js?build=${BUILD}`,()=>load('stainher-weekly-hp-router-r69',`stainher-v1524-hp-router-r57.js?build=${BUILD}`));
    load('stainher-leadership-orphan-runtime-r69',`stainher-v1524-leadership-orphan-filter.js?build=${BUILD}`);
    return true;
  }

  window.addEventListener('stainher:profile-ready',start);
  window.addEventListener('stainher:session-ready',start);
  if(!start())timer=setInterval(()=>{if(start()||++checks>=120){clearInterval(timer);timer=null;}},1000);
})();