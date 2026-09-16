/* Stainher V15.24 · Runtime Audit R78 · no ejecutar parches de app antes de autenticación. */
(()=>{
  'use strict';
  if(window.__STAINHER_RUNTIME_AUDIT_R78__)return;
  window.__STAINHER_RUNTIME_AUDIT_R78__=true;

  const BUILD='20260916-r78-hp-stability';
  const load=(id,src,onload)=>{
    if(document.getElementById(id)){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('[Stainher R78] '+src),{once:true});
    document.head.appendChild(s);
  };

  const hasSession=()=>Boolean(window.state?.session?.user||window.state?.user?.id);
  let started=false,checks=0,timer=null;
  function start(){
    if(started||!hasSession())return false;
    started=true;
    if(timer){clearInterval(timer);timer=null;}
    load('stainher-runtime-audit-legacy-r78',`stainher-v1524-runtime-audit-legacy-r49.js?build=${BUILD}`);
    load('stainher-home-no-vacation-r78',`stainher-v1524-home-no-vacation-r57.js?build=${BUILD}`);
    load('stainher-turnos-teletrabajo-r78',`stainher-turnos-teletrabajo-r75.js?build=${BUILD}-${Date.now()}`);
    load('stainher-hp-loader-r78',`stainher-v1524-hp-loader-r72.js?build=${BUILD}-${Date.now()}`);
    load('stainher-leadership-orphan-runtime-r78',`stainher-v1524-leadership-orphan-filter.js?build=${BUILD}`);
    return true;
  }

  window.addEventListener('stainher:profile-ready',start);
  window.addEventListener('stainher:session-ready',start);
  if(!start())timer=setInterval(()=>{if(start()||++checks>=120){clearInterval(timer);timer=null;}},1000);
})();
