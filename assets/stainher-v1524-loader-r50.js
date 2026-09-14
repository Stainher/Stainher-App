/* Stainher V15.24 · Loader R50 de modulos nuevos. */
(()=>{
  'use strict';
  if(window.__STAINHER_LOADER_R50__)return;
  window.__STAINHER_LOADER_R50__=true;
  const modules=[
    ['stainher-r50-hp','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r50'],
    ['stainher-r50-leadership','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r50']
  ];
  const load=([id,src])=>new Promise(resolve=>{
    if(document.getElementById(id))return resolve();
    const s=document.createElement('script');
    s.id=id;s.src=src;s.async=false;
    s.onload=()=>resolve();
    s.onerror=()=>{console.error('[Stainher R50] No se pudo cargar '+src);resolve()};
    document.head.appendChild(s);
  });
  async function boot(){for(const m of modules)await load(m)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
