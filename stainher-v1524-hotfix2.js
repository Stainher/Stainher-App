/* Compatibilidad R50: continúa el loader y asegura HP/Liderazgo. */
(()=>{
  'use strict';
  const load=(id,src)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.addEventListener('error',()=>console.error('[Stainher R50] '+src),{once:true});document.head.appendChild(s)};
  load('stainher-weekly-hp-r50-fallback','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r50-fallback');
  load('stainher-leadership-orphan-r50-fallback','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r50-fallback');
  load('stainher-hotfix2-assets-r50','assets/stainher-v1524-hotfix2.js?build=20260914-r50');
})();
