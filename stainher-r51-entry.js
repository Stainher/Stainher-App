/* Stainher R51 · punto de entrada confirmado desde config.js raíz. */
(()=>{
  'use strict';
  function load(id,src){
    if(document.getElementById(id)) return;
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    s.addEventListener('error',()=>console.error('No se pudo cargar',src),{once:true});
    document.head.appendChild(s);
  }
  function boot(){
    load('stainher-weekly-hp-r51','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r51-live-entry');
    load('stainher-leadership-orphan-r51','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r51-live-entry');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
