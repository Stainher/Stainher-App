/* Stainher V15.24 · R77 · cargador HP anti-cache.
 * No contiene lógica de login/sesión. Solo renueva los módulos HP cuando
 * el runtime autenticado lo invoca, evitando reutilizar versiones anteriores.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_VERSION__==='R77')return;
  window.__STAINHER_HP_LOADER_R72__=true;
  window.__STAINHER_HP_LOADER_VERSION__='R77';

  const BUILD='20260916-r77-hp-layout';
  const fresh=src=>`${src}${src.includes('?')?'&':'?'}build=${encodeURIComponent(`${BUILD}-${Date.now()}`)}`;
  const load=(id,src)=>new Promise((resolve,reject)=>{
    document.getElementById(id)?.remove();
    const s=document.createElement('script');
    s.id=id;
    s.src=fresh(src);
    s.async=false;
    s.addEventListener('load',()=>resolve(s),{once:true});
    s.addEventListener('error',()=>reject(new Error(`No fue posible cargar ${src}`)),{once:true});
    document.head.appendChild(s);
  });

  async function refresh(){
    try{
      await load('stainher-weekly-hp-runtime-r77','stainher-v1524-weekly-hp-report.js');
      await load('stainher-hp-history-runtime-r77','stainher-v1524-hp-history-r71.js');
      await load('stainher-hp-admin-detail-runtime-r77','stainher-v1524-hp-admin-detail-r74.js');
      await load('stainher-hp-layout-runtime-r77','stainher-v1524-hp-layout-r77.js');
      await load('stainher-weekly-hp-router-r77','stainher-v1524-hp-router-r57.js');
      window.dispatchEvent(new CustomEvent('stainher:hp-r77-ready'));
    }catch(error){
      console.error('[Stainher HP R77]',error);
    }
  }

  window.StainherHPR72={refresh};
  window.StainherHPR75={refresh};
  window.StainherHPR77={refresh};
  refresh();
})();
