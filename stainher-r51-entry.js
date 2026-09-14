/* Stainher R52 · punto de entrada confirmado desde config.js raíz. */
(()=>{
  'use strict';
  function load(id,src,onload){
    if(document.getElementById(id)){onload?.();return;}
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    if(onload)s.addEventListener('load',onload,{once:true});
    s.addEventListener('error',()=>console.error('No se pudo cargar',src),{once:true});
    document.head.appendChild(s);
  }
  function boot(){
    load('stainher-weekly-hp-r52','assets/stainher-v1524-weekly-hp-report.js?build=20260914-r52-role-fix',()=>{
      load('stainher-weekly-hp-role-r52','assets/stainher-v1524-weekly-hp-role-fix.js?build=20260914-r52-role-fix');
    });
    load('stainher-leadership-orphan-r52','assets/stainher-v1524-leadership-orphan-filter.js?build=20260914-r52-role-fix');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
