/* Stainher V15.24 · Runtime Audit R53 · rutas activas bajo <base href="./assets/">. */
(()=>{
  'use strict';
  const load=(id,src,onload)=>{
    if(document.getElementById(id)){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('[Stainher R53] No se pudo cargar '+src),{once:true});
    document.head.appendChild(s);
  };

  /* index.html define <base href="./assets/">, por lo que estos nombres deben
     ser relativos al directorio assets y no volver a anteponer "assets/". */
  load('stainher-runtime-audit-legacy-r53','stainher-v1524-runtime-audit-legacy-r49.js?build=20260914-r53-active-assets');
  load('stainher-weekly-hp-runtime-r53','stainher-v1524-weekly-hp-report.js?build=20260914-r53-active-assets',()=>{
    load('stainher-weekly-hp-role-r53','stainher-v1524-weekly-hp-role-fix.js?build=20260914-r53-active-assets');
  });
  load('stainher-leadership-orphan-runtime-r53','stainher-v1524-leadership-orphan-filter.js?build=20260914-r53-active-assets');
})();
