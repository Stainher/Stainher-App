/* Stainher V15.24 · Runtime Audit R57 · rutas activas bajo <base href="./assets/">. */
(()=>{
  'use strict';
  const load=(id,src,onload)=>{
    const existing=document.getElementById(id);
    if(existing){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('[Stainher R57] No se pudo cargar '+src),{once:true});
    document.head.appendChild(s);
  };

  const BUILD='20260914-r57-hp-authoritative';
  load('stainher-runtime-audit-legacy-r57',`stainher-v1524-runtime-audit-legacy-r49.js?build=${BUILD}`);
  load('stainher-home-no-vacation-r57',`stainher-v1524-home-no-vacation-r57.js?build=${BUILD}`);
  load('stainher-weekly-hp-runtime-r57',`stainher-v1524-weekly-hp-report.js?build=${BUILD}`,()=>{
    load('stainher-weekly-hp-router-r57',`stainher-v1524-hp-router-r57.js?build=${BUILD}`);
  });
  load('stainher-leadership-orphan-runtime-r57',`stainher-v1524-leadership-orphan-filter.js?build=${BUILD}`);
})();
