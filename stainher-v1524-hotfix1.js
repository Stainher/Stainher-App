/* Puente de compatibilidad para el loader raíz V15.24. */
(()=>{
  'use strict';
  const load=(id,src)=>{
    if(document.getElementById(id))return;
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    s.addEventListener('error',()=>console.error('[Stainher] No se pudo cargar '+src),{once:true});
    document.head.appendChild(s);
  };
  load('stainher-v1524-weekly-hp-bridge','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r49-loader-bridge');
  load('stainher-v1524-leadership-orphan-bridge','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r49-loader-bridge');
})();
