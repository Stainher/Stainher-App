/* Stainher V15.24 · Runtime Audit R50 bootstrap. */
(()=>{
  'use strict';
  const load=(id,src)=>{
    if(document.getElementById(id))return;
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;
    s.addEventListener('error',()=>console.error('[Stainher R50] No se pudo cargar '+src),{once:true});
    document.head.appendChild(s);
  };
  load('stainher-runtime-audit-legacy-r50','assets/stainher-v1524-runtime-audit-legacy-r49.js?build=20260914-r50');
  load('stainher-weekly-hp-runtime-r50','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r50-runtime');
  load('stainher-leadership-orphan-runtime-r50','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r50-runtime');
})();
